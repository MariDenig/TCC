const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controller para registro de usuário
exports.registerUser = async (req, res) => {
  console.log("Chegou aqui");
  try {
    console.log('Payload recebido em /api/users/register:', req.body);
    const { nome, sobrenome, email, senha } = req.body;
    if (!nome || !sobrenome || !email || !senha) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
    }
    // Verifica se o e-mail já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }
    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);
    // Cria novo usuário
    const newUser = new User({ nome, sobrenome, email, senha: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error && error.stack ? error.stack : error);
    // Erro de duplicidade de chave (email único)
    if (error && (error.code === 11000 || (error.keyPattern && error.keyPattern.email))) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }
    // Erros de validação do Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dados inválidos.', details: error.errors });
    }
    return res.status(500).json({ message: 'Erro ao cadastrar usuário.', error: error && error.message ? error.message : String(error) });
  }
};

// Controller para login de usuário
exports.loginUser = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
    }
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'seu_jwt_secret_aqui_123456789', { expiresIn: '1d' });
    res.json({ token, user: { nome: user.nome, sobrenome: user.sobrenome, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login.', error });
  }
};
