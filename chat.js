const liveAgentEndpoint = 'https://d.la4-c1cs-ia5.salesforceliveagent.com/chat/rest/'; // Reemplaza con tu endpoint
const liveAgentVersion = '60'; // La versión de la API de Live Agent
sequence = 1;
affinityToken = null;
sessionId = null;
sessionKey = null;
getSessionId();


function sendMessage() {
    var message = document.getElementById("userMessage").value;
    var chatBox = document.getElementById("chatBox");
    
    var messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.textContent = message;

    console.log(message)
    chatBox.appendChild(messageDiv);
    sendMessage(message);

    // Limpiar el campo de entrada después de enviar
    document.getElementById("userMessage").value = "";
}

function getSessionId() {
    const url = `${liveAgentEndpoint}System/SessionId`;
    const headers = {
        'X-LIVEAGENT-API-VERSION': liveAgentVersion,
        'X-LIVEAGENT-AFFINITY': 'null'
    };

    fetch(url, { headers: headers, method: 'GET' })
        .then(response => response.json())
        .then(data => {
            affinityToken = data.affinityToken;
            sessionId = data.id;
            sessionKey = data.key;
            console.log('Resultado de getSessionId:', data); // Agregado console.log
            initiateChat(data);
        })
        .catch(error => console.error('Error al obtener el ID de sesión:', error));
}

function initiateChat(sessionData) {
    const chatInitUrl = `${liveAgentEndpoint}Chasitor/ChasitorInit`; // Reemplaza 'hostname' con tu endpoint real
    const headers = {
        'X-LIVEAGENT-API-VERSION': liveAgentVersion, // Reemplaza con tu versión de API
        'X-LIVEAGENT-AFFINITY': affinityToken, // Reemplaza con tu token de afinidad obtenido de la respuesta de SessionId
        'X-LIVEAGENT-SESSION-KEY': sessionKey, // Reemplaza con tu clave de sesión obtenida de la respuesta de SessionId
        'X-LIVEAGENT-SEQUENCE': sequence// Puede empezar desde 1 y aumentar con cada solicitud
    };
    
    const chatInitData = {
        organizationId: "00D8J0000008gU0",
        deploymentId: "5728J000000004l",
        buttonId: "5738J000000005A",
        sessionId: sessionId,
        visitorName: "John Doe",
        prechatDetails: [],
        prechatEntities: [],
        receiveQueueUpdates: true,
        isPost: true,
        language: "en-US",
        screenResolution: "2560x1440",
        userAgent: navigator.userAgent,
        doFallback: false
    };

    fetch(chatInitUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(chatInitData)
    })
    .then(response => {
        sequence++;
        console.log('Resultado de initiateChat:', response); // Agregado console.log
    })
    .catch(error => console.error('Error al iniciar chat:', error));
}

function sendMessage(message) {
    const chatInitUrl = `${liveAgentEndpoint}Chasitor/ChatMessage`; // Reemplaza 'hostname' con tu endpoint real
    const headers = {
        'X-LIVEAGENT-API-VERSION': liveAgentVersion, // Reemplaza con tu versión de API
        'X-LIVEAGENT-AFFINITY': affinityToken, // Reemplaza con tu token de afinidad obtenido de la respuesta de SessionId
        'X-LIVEAGENT-SESSION-KEY': sessionKey, // Reemplaza con tu clave de sesión obtenida de la respuesta de SessionId
        'X-LIVEAGENT-SEQUENCE': sequence// Puede empezar desde 1 y aumentar con cada solicitud
    };
    
    const bodyMessage = {
        text: message
    };
    console.log(bodyMessage)

    fetch(chatInitUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyMessage)
    })
    .then(response => {
        sequence++;
        console.log('Resultado de mensaje:', response); // Agregado console.log
    })
    .catch(error => console.error('Error al iniciar chat:', error));
}
