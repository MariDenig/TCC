import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// Elementos do DOM
const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

// Configuração da API
const genAI = new GoogleGenerativeAI(API_KEY);

// --- Variáveis de Sessão e Histórico ---
let chatHistory = [];
let isWaitingForResponse = false;
let currentQuestionIndex = 0;
let userScore = 0;
let quizStarted = false;

// Gera um ID único para a sessão de chat ao carregar a página
const currentSessionId = `sessao_${Date.now()}_${Math.random().toString(36).substring(7)}`;
const chatStartTime = new Date();
const BOT_ID = "PhysicsGenius_v1";

// --- Banco de Perguntas do Quiz ---
const quizQuestions = [
    {
        question: "1. Um caminhão se desloca com velocidade constante de 144 km/h. Suponha que o motorista cochile durante 3 s. Qual a distância, em metros, percorrida pelo caminhão nesse intervalo de tempo se ele não colidir com algum obstáculo?",
        options: [
            "a) 120 m",
            "b) 144 m", 
            "c) 432 m",
            "d) 480 m"
        ],
        correctAnswer: "a",
        explanation: "Para resolver: 144 km/h = 40 m/s. Em 3 segundos: 40 m/s × 3 s = 120 m"
    },
    {
        question: "2. Qual é a diferença entre deslocamento e trajetória, segundo a explicação de Newton?",
        options: [
            "a) Deslocamento é a soma de todas as distâncias; trajetória é só a linha reta.",
            "b) Deslocamento é a linha reta entre dois pontos; trajetória é o caminho percorrido.",
            "c) Ambos são a mesma coisa.",
            "d) Deslocamento envolve curvas; trajetória é sempre reta."
        ],
        correctAnswer: "b",
        explanation: "Deslocamento é a linha reta entre dois pontos; trajetória é o caminho percorrido."
    },
    {
        question: "3. A maçã percorreu 100 metros em 40 segundos. Qual foi sua velocidade média?",
        options: [
            "a) 2 m/s",
            "b) 4 m/s", 
            "c) 2,5 m/s",
            "d) 1,5 m/s"
        ],
        correctAnswer: "c",
        explanation: "Velocidade média = distância/tempo = 100m/40s = 2,5 m/s"
    },
    {
        question: "4. A unidade utilizada para a velocidade média no SI (Sistema Internacional de unidades) é:",
        options: [
            "a) km/h",
            "b) m/h",
            "c) m/s", 
            "d) m/min"
        ],
        correctAnswer: "c",
        explanation: "No SI, a unidade de velocidade é m/s (metros por segundo)"
    },
    {
        question: "5. Qual é o fator usado para converter de km/h para m/s?",
        options: [
            "a) Multiplicar por 3,6",
            "b) Dividir por 3,6",
            "c) Somar 3,6",
            "d) Subtrair 3,6"
        ],
        correctAnswer: "b",
        explanation: "Para converter km/h para m/s, divide-se por 3,6"
    },
    {
        question: "6. Um ciclista se move a 36 km/h. Qual é sua velocidade em m/s?",
        options: [
            "a) 10 m/s",
            "b) 12 m/s",
            "c) 9 m/s",
            "d) 3,6 m/s"
        ],
        correctAnswer: "a",
        explanation: "36 km/h ÷ 3,6 = 10 m/s"
    },
    {
        question: "7. Um carro anda com velocidade constante de 15 m/s durante 2 minutos. Qual a distância percorrida?",
        options: [
            "a) 30 m",
            "b) 180 m",
            "c) 900 m",
            "d) 1800 m"
        ],
        correctAnswer: "d",
        explanation: "2 minutos = 120 segundos. Distância = 15 m/s × 120 s = 1800 m"
    }
];

// --- Funções de Logging, Ranking e Histórico ---

// Função para registrar o primeiro acesso (mantida)
async function registrarConexaoUsuario() { 
    try {
        const logData = { acao: "acesso_inicial_chatbot", nomeBot: "PhysicsGenius" };
        const response = await fetch('/api/log-connection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        });
        if (!response.ok) console.error("Falha ao registrar log:", await response.text());
        else console.log("Log de conexão registrado.");
    } catch (error) {
        console.error("Erro de rede ao registrar log:", error);
    }
}

// Função para registrar acesso para ranking (mantida)
async function registrarAcessoBotParaRanking() { 
    try {
        const dataRanking = { botId: BOT_ID, nomeBot: "PhysicsGenius" };
        const response = await fetch('/api/ranking/registrar-acesso-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataRanking)
        });
        if (!response.ok) console.error("Falha ao registrar para ranking:", await response.text());
        else console.log("Registro de ranking enviado.");
    } catch (error) {
        console.error("Erro de rede ao registrar para ranking:", error);
    }
}

// NOVA FUNÇÃO: Envia o histórico completo da sessão para o backend
async function salvarHistoricoSessao(messages) {
    try {
        const payload = {
            sessionId: currentSessionId,
            botId: BOT_ID,
            startTime: chatStartTime.toISOString(),
            endTime: new Date().toISOString(),
            messages: messages
        };
        
        console.log("Tentando salvar histórico:", payload);
        
        const response = await fetch('/api/chat/salvar-historico', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Falha ao salvar histórico:", response.status, errorText);
        } else {
            const result = await response.json();
            console.log("✅ Histórico de sessão enviado com sucesso:", result.message);
        }
    } catch (error) {
        console.error("❌ Erro de rede ao enviar histórico de sessão:", error);
    }
}

// --- Funções do Quiz ---

function startQuiz() {
    quizStarted = true;
    currentQuestionIndex = 0;
    userScore = 0;
    showCurrentQuestion();
}

function showCurrentQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        showQuizResults();
        return;
    }

    const question = quizQuestions[currentQuestionIndex];
    let questionText = `${question.question}\n\n`;
    
    question.options.forEach(option => {
        questionText += `${option}\n`;
    });
    
    questionText += "\nDigite a letra da sua resposta (a, b, c ou d):";
    
    addMessageToUI(questionText, 'bot');
}

function checkAnswer(userAnswer) {
    const question = quizQuestions[currentQuestionIndex];
    const normalizedAnswer = userAnswer.toLowerCase().trim();
    
    let response = "";
    
    if (normalizedAnswer === question.correctAnswer.toLowerCase()) {
        userScore++;
        response = `✅ Correto! Parabéns!\n\nExplicação: ${question.explanation}`;
    } else {
        response = `❌ Incorreto. A resposta correta é: ${question.correctAnswer.toUpperCase()}\n\nExplicação: ${question.explanation}`;
    }
    
    addMessageToUI(response, 'bot');
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizQuestions.length) {
        setTimeout(() => {
            addMessageToUI("Próxima pergunta:", 'bot');
            setTimeout(showCurrentQuestion, 1000);
        }, 2000);
    } else {
        setTimeout(showQuizResults, 2000);
    }
}

function showQuizResults() {
    const percentage = Math.round((userScore / quizQuestions.length) * 100);
    let resultMessage = `🎉 Quiz Concluído!\n\n`;
    resultMessage += `Sua pontuação: ${userScore}/${quizQuestions.length} (${percentage}%)\n\n`;
    
    if (percentage >= 80) {
        resultMessage += "🌟 Excelente! Você domina bem os conceitos de cinemática!";
    } else if (percentage >= 60) {
        resultMessage += "👍 Bom trabalho! Continue estudando para melhorar ainda mais!";
    } else {
        resultMessage += "📚 Continue estudando! A prática leva à perfeição!";
    }
    
    resultMessage += "\n\nDigite 'quiz' para fazer o quiz novamente ou 'ajuda' para ver outras opções.";
    
    addMessageToUI(resultMessage, 'bot');
    quizStarted = false;
}

// --- Lógica Principal do Chat ---

async function sendMessage(userInput) {
    if (isWaitingForResponse) return;
    
    isWaitingForResponse = true;
    sendButton.disabled = true;
    addMessageToUI(userInput, 'user');
    messageInput.value = '';
    
    // Adiciona a mensagem do usuário ao histórico
    chatHistory.push({ role: "user", parts: [{ text: userInput }] });

    try {
        let botResponse = "";
        
        if (quizStarted) {
            // Modo quiz ativo
            const normalizedInput = userInput.toLowerCase().trim();
            if (['a', 'b', 'c', 'd'].includes(normalizedInput)) {
                checkAnswer(normalizedInput);
            } else {
                botResponse = "Por favor, digite apenas a letra da sua resposta (a, b, c ou d).";
                addMessageToUI(botResponse, 'bot');
            }
        } else {
            // Modo conversa normal
            const normalizedInput = userInput.toLowerCase().trim();
            
            if (normalizedInput === 'quiz' || normalizedInput.includes('quiz')) {
                startQuiz();
            } else if (normalizedInput === 'ajuda' || normalizedInput.includes('ajuda')) {
                botResponse = `Olá! Sou o Quiz de Cinemática! Aqui estão as opções disponíveis:

📝 **Quiz de Cinemática**: Digite 'quiz' para começar um teste com 7 perguntas sobre movimento, velocidade e aceleração.

💬 **Conversa Livre**: Você pode fazer perguntas sobre física e eu tentarei ajudar!

🎯 **Comandos Disponíveis**:
- 'quiz': Iniciar o quiz de cinemática
- 'ajuda': Ver esta mensagem de ajuda

Como posso ajudar você hoje?`;
                         } else {
                 // Usar a API do Gemini para respostas gerais
                 const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                 const chat = model.startChat({ history: chatHistory.slice(0, -1) });
                 
                 const prompt = `Você é um assistente de física em português brasileiro. Responda sempre em português brasileiro de forma clara e didática. Pergunta do usuário: ${userInput}`;
                 const result = await chat.sendMessage(prompt);
                 botResponse = result.response.text();
             }
            
            if (botResponse) {
                addMessageToUI(botResponse, 'bot');
                chatHistory.push({ role: "model", parts: [{ text: botResponse }] });
            }
        }
        
        // Salva o histórico da sessão
        await salvarHistoricoSessao(chatHistory);

    } catch (err) {
        console.error("Erro ao processar mensagem:", err);
        addMessageToUI(`Ocorreu um erro: ${err.message}`, 'bot');
    } finally {
        isWaitingForResponse = false;
        sendButton.disabled = messageInput.value.trim().length === 0;
    }
}

function addMessageToUI(text, sender) { 
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    let processedText = text.replace(/</g, "<").replace(/>/g, ">");

    if (sender === 'bot') {
        processedText = processedText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\$\$(.*?)\$\$/g, '<div class="physics-formula">$1</div>')
            .replace(/\$(.*?)\$/g, '<span class="formula">$1</span>')
            .replace(/\n/g, '<br>');
    }

    messageElement.innerHTML = `
        <div class="message-header ${sender}">
            <div class="avatar">${sender === 'user' ? 'U' : 'QC'}</div>
            <span>${sender === 'user' ? 'Você' : 'Quiz de Cinemática'}</span>
        </div>
        <div class="message-content">${processedText}</div>`;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

function showTypingIndicator() { typingIndicator.style.display = 'flex'; scrollToBottom(); }
function removeTypingIndicator() { typingIndicator.style.display = 'none'; }
function scrollToBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }

function handleUserMessage() {
    const userMessage = messageInput.value.trim();
    if (userMessage) sendMessage(userMessage);
}



// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Chamadas iniciais
    registrarConexaoUsuario();
    registrarAcessoBotParaRanking();

    addMessageToUI(`Olá! Sou o Quiz de Cinemática! 🚀

🎯 **Quiz de Cinemática**: Digite 'quiz' para testar seus conhecimentos sobre movimento, velocidade e aceleração!

💬 **Conversa Livre**: Você também pode fazer perguntas sobre física e eu tentarei ajudar.

Digite 'ajuda' para ver todas as opções disponíveis.`, 'bot');
    
    sendButton.addEventListener('click', handleUserMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isWaitingForResponse) {
            e.preventDefault();
            handleUserMessage();
        }
    });
    
    
    
    messageInput.addEventListener('input', () => {
        sendButton.disabled = messageInput.value.trim().length === 0 || isWaitingForResponse;
    });
    
    sendButton.disabled = true;
});