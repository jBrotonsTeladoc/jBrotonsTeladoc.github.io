const liveAgentEndpoint = 'https://d.la4-c1cs-ia5.salesforceliveagent.com/chat/rest/'; // Reemplaza con tu endpoint
const liveAgentVersion = '60'; // La versión de la API de Live Agent

getSessionId();


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

function getSessionId() {
    const url = `${liveAgentEndpoint}System/SessionId`;
    const headers = {
        'X-LIVEAGENT-API-VERSION': liveAgentVersion,
        'X-LIVEAGENT-AFFINITY': 'null'
    };

    fetch(url, { headers: headers })
        .then(response => response.json())
        .then(data => {
            console.log('Resultado de getSessionId:', data); // Agregado console.log
        })
        .catch(error => console.error('Error al obtener el ID de sesión:', error));
}
