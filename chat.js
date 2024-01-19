const liveAgentEndpoint = 'https://d.la4-c1cs-ia5.salesforceliveagent.com/chat/rest/'; // Reemplaza con tu endpoint
const liveAgentVersion = '60'; // La versión de la API de Live Agent

sequence = 1;
affinityToken = null;
sessionId = null;
sessionKey = null;
getSessionId();
receiveSFMessages();


function newMessageInChat(classMessage, message){
    var chatBox = document.getElementById("chatBox");
    var messageDiv = document.createElement("div");
    messageDiv.classList.add(classMessage);
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
}

function sendMessage() {
    var message = document.getElementById("userMessage").value;
    newMessageInChat("message", message)
    sendMessageSF(message);
    document.getElementById("userMessage").value = "";
}

function createSFChatMessage(message){
    newMessageInChat("messageSF", message)
}


function createHeaders() {
    return {
        'X-LIVEAGENT-API-VERSION': liveAgentVersion,
        'X-LIVEAGENT-AFFINITY': affinityToken || 'null',
        'X-LIVEAGENT-SESSION-KEY': sessionKey,
        'X-LIVEAGENT-SEQUENCE': sequence
    };
}

function apiCall(url, method, body = null) {
    const headers = createHeaders();
    return fetch(url, {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : undefined
    })
    .then(response => {
        return response.json();
    });
}

function apiCallText(url, method, body = null) {
    const headers = createHeaders();
    return fetch(url, {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : undefined
    })
    .then(response => {
        return response.text();
    });
}

function getSessionId() {
    const url = `${liveAgentEndpoint}System/SessionId`;
    apiCall(url,'GET')
        .then(data => {
            affinityToken = data.affinityToken;
            sessionId = data.id;
            sessionKey = data.key;
            console.log('Resultado de getSessionId:', data);
            initiateChat(data);
        })
        .catch(error => console.error('Error al obtener el ID de sesión:', error));
}

function initiateChat() {
    const chatInitUrl = `${liveAgentEndpoint}Chasitor/ChasitorInit`; 
    const chatInitData = {
        organizationId: "00D8J0000008gU0",
        deploymentId: "5728J000000004l",
        buttonId: "5738J000000005A",
        sessionId: sessionId,
        visitorName: "John Doe",
        prechatDetails: [
            {
            label: "E-mail Address",
            value: "jon@example.com",
            transcriptFields: [
                    "c__EmailAddress"
            ],
            displayToAgent: true 
            },
            {
                label: "Previous Conversation",
                value: "{ [ { text: 'Hello World', type: 'Bot' }, { text: 'Hello', type: 'user' }, { text: 'How are you?', type: 'user' }, { text: 'Im fine, thanks', type: 'Bot' }, { text: 'Whats your name?', type: 'user' }, { text: 'My name is Bot', type: 'Bot' } ] }",
                transcriptFields: [
                        "c__Transcript"
                ],
                displayToAgent: true 
            }
        ],
        prechatEntities: [],
        receiveQueueUpdates: true,
        isPost: true,
        language: "en-US",
        screenResolution: "2560x1440",
        userAgent: navigator.userAgent,
        doFallback: false
    };
    apiCallText(chatInitUrl, 'POST', chatInitData)
        .then(response => {
            sequence++;
            console.log('Resultado de initiateChat:', response);
        })
        .catch(error => console.error('Error al iniciar chat:', error));
}

function sendMessageSF(message) {
    const chatInitUrl = `${liveAgentEndpoint}Chasitor/ChatMessage`;
    apiCallText(chatInitUrl, 'POST', {text: message})
        .then(response => {
            sequence++;
            console.log('Resultado de mensaje:', response);
        })
        .catch(error => console.error('Error al iniciar chat:', error));
}

async function receiveSFMessages(){
    await sleep(2000);
    const url = `${liveAgentEndpoint}System/Messages`;
    apiCall(url,'GET')
        .then(data => {
            console.log('Resultado de mensaje:', data);
            if(data.messages.length > 0){
                data.messages.forEach(element => {
                    if(element.type == "ChatMessage" && element.message.text != ""){
                        createSFChatMessage(element.message.text);
                    }
                });
            }
            receiveSFMessages();
        })
        .catch(error => console.error('Error al obtener el mensaje de sesión:', error));
}

function exitChat(){ 
    const chatInitUrl = `${liveAgentEndpoint}Chasitor/ChatEnd`; // Reemplaza 'hostname' con tu endpoint real
    apiCallText(chatInitUrl, 'POST', {reason: "client"})
        .then(response => {
            sequence++;
            console.log('Resultado de cerrarChat:', response); // Agregado console.log
        })
        .catch(error => console.error('Error al iniciar chat:', error));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

