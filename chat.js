
function sendMessage() {
    var message = document.getElementById("userMessage").value;
    var chatBox = document.getElementById("chatBox");
    
    var messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.textContent = message;

    chatBox.appendChild(messageDiv);

    // Limpiar el campo de entrada después de enviar
    document.getElementById("userMessage").value = "";
}


// Inicia el proceso
//getSessionId();
