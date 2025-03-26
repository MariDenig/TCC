emailjs.init("4NxQoSbCFUf6h8piL");

document.getElementById("contact-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if (name === "" || email === "" || message === "") {
        alert("Por favor, preencha todos os campos.");
        return;
    }

   const templateParams = {
    name: name,
    email: email,
    message: message
   };
 
   emailjs.send("service_ne185yy", "template_r1bta67", templateParams).then(function (response) {
    alert("Mensagem enviada com sucesso!");
    name = "";
    email = "";
    message = "";
   }).catch(function (error) {
    alert("Erro ao enviar mensagem. Por favor, tente novamente.");
   }) ;
});
