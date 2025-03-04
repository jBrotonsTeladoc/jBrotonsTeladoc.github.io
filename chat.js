const liveAgentEndpoint = 'https://d.la12s-core1.sfdc-8tgtt5.salesforceliveagent.com/chat/rest/'; // Reemplaza con tu endpoint
const liveAgentVersion = '60'; // La versión de la API de Live Agent
const nameVisitor = 'Alexander Gimenez'; // Nombre del visitante
let sequence = 1;
let affinityToken = null;
let sessionId = null;
let sessionKey = null;

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
    newMessageInChat("message", message);
    sendMessageSF(message);
    // Enviar custom event después de enviar el mensaje
    sendCustomEvent();
    document.getElementById("userMessage").value = "";
}

function createSFChatMessage(message){
    newMessageInChat("messageSF", message);
}

/**
 * Crea los headers y asigna la secuencia actual.
 * Cada llamada a esta función incrementa la secuencia.
 */
function createHeaders() {
    const headers = {
        'X-LIVEAGENT-API-VERSION': liveAgentVersion,
        'X-LIVEAGENT-AFFINITY': affinityToken || 'null',
        'X-LIVEAGENT-SESSION-KEY': sessionKey,
        'X-LIVEAGENT-SEQUENCE': sequence
    };
    sequence++;  // Incrementamos inmediatamente para la próxima llamada
    return headers;
}

function apiCall(url, method, body = null) {
    const headers = createHeaders();
    return fetch(url, {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : undefined
    })
    .then(response => {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            return response.text();
        }
    });
}

function apiCallText(url, method, body = null) {
    const headers = createHeaders();
    return fetch(url, {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : undefined
    })
    .then(response => response.text());
}

function getSessionId() {
    const url = `${liveAgentEndpoint}System/SessionId`;
    apiCall(url, 'GET')
        .then(data => {
            affinityToken = data.affinityToken;
            sessionId = data.id;
            sessionKey = data.key;
            console.log('Resultado de getSessionId:', data);
            initiateChat();
        })
        .catch(error => console.error('Error al obtener el ID de sesión:', error));
}

function initiateChat() {
    const chatInitUrl = `${liveAgentEndpoint}Chasitor/ChasitorInit`; 

    const chatInitData = {
        organizationId: "00D6u0000008g8A",
        deploymentId: "572dn0000001TmL",
        buttonId: "573dn0000000MRx",
        sessionId: sessionId,
        visitorName: nameVisitor,
        prechatDetails: [
            {
                label: "Email",
                value: "member14cde73a45e@mailinator.com",
                transcriptFields: ["c__EmailAddress"],
                displayToAgent: true
            },
            {
                label: "LastName",
                value: "Gertrudis S",
                transcriptFields: ["c__LastName"],
                displayToAgent: true
            },
            {
                label: "MemberId",
                value: 1,
                transcriptFields: ["c__MemberId"],
                displayToAgent: true
            },
            {
                label: "Transcript",
                value: JSON.stringify({
                    messages: [
                        {
                            type: "Bot",
                            text: "Hi! I'm your Health Assistant...\nWhat can I help you with today?",
                            name: "Assistant Bot",
                            time: "2025-01-22 07:34:32 -0600"
                        },
                        {
                            type: "user",
                            text: "hello",
                            name: "Gertrudis Schinner",
                            time: "2025-01-22 07:34:40 -0600"
                        },
                        {
                            type: "Bot",
                            text: "Hello! I am your virtual health assistant. What can I help you with today?",
                            name: "Assistant Bot",
                            time: "2025-01-22 07:34:45 -0600"
                        },
                        {
                            type: "user",
                            text: "agent",
                            name: "Gertrudis Schinner",
                            time: "2025-01-22 07:34:57 -0600"
                        },
                        {
                            type: "Bot",
                            text: "I understand you want to talk to a person...\nCan you tell me about the nature of your request?",
                            name: "Assistant Bot",
                            time: "2025-01-22 07:35:01 -0600"
                        },
                        {
                            type: "user",
                            text: "agent",
                            name: "Gertrudis Schinner",
                            time: "2025-01-22 07:35:06 -0600"
                        },
                        {
                            type: "Bot",
                            text: "{\"keyboard_actions\":[\"ACTION_DISMISS_KEYBOARD\"],\"options\":[{\"type\":\"fulfillment\",\"label\":\"Chat with a live agent\",\"text\":\"FULFILLMENT_LIVE_AGENT\"},{\"type\":\"fulfillment\",\"label\":\"Call Member Support (855-805-8447)\",\"text\":\"FULFILLMENT_CALL_TELADOC\"}]}",
                            name: "Assistant Bot",
                            time: "2025-01-22 07:35:12 -0600"
                        },
                        {
                            type: "Bot",
                            text: "A customer service agent is on their way to help.",
                            name: "Assistant Bot",
                            time: "2025-01-22 07:35:15 -0600"
                        }
                    ]
                }),
                transcriptFields: ["c__Transcript"],
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
            console.log('Resultado de initiateChat:', response);
        })
        .catch(error => console.error('Error al iniciar chat:', error));
}

function sendMessageSF(message) {
    const chatMessageUrl = `${liveAgentEndpoint}Chasitor/ChatMessage`;
    apiCallText(chatMessageUrl, 'POST', { text: message })
        .then(response => {
            console.log('Resultado de mensaje:', response);
        })
        .catch(error => console.error('Error al enviar mensaje:', error));
}

function sendCustomEvent() {
    const customEventUrl = `${liveAgentEndpoint}Chasitor/CustomEvent`;
    // Asegúrate de enviar data en formato string (ya lo tienes '[3,4]')
    const customEventData = {
        type: "Attachment",
        data: '[3,4]'
    };
    apiCallText(customEventUrl, 'POST', customEventData)
        .then(response => {
            console.log('Custom event enviado:', response);
        })
        .catch(error => console.error('Error al enviar custom event:', error));
}

async function receiveSFMessages(){
    await sleep(5000);
    const url = `${liveAgentEndpoint}System/Messages`;
    apiCall(url, 'GET')
        .then(data => {
            console.log('Resultado de mensaje:', data);
            if (data && data.messages && data.messages.length > 0) {
                data.messages.forEach(element => {
                    if (element.type === "ChatMessage" && element.message.text !== "") {
                        createSFChatMessage(element.message.text);
                    }
                });
            }
            receiveSFMessages();
        })
        .catch(error => console.error('Error al obtener mensaje de sesión:', error));
}

function exitChat(){ 
    const chatEndUrl = `${liveAgentEndpoint}Chasitor/ChatEnd`;
    apiCallText(chatEndUrl, 'POST', { reason: "client" })
        .then(response => {
            console.log('Resultado de cerrarChat:', response);
        })
        .catch(error => console.error('Error al cerrar chat:', error));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const prechatValue = {
    messages: [
        {
            type: "Bot",
            text: "Hello World",
            name: "Assistance Bot",
            time: "16:30 22/01/2023"
        },
        {
            type: "user",
            text: "Hello",
            name: nameVisitor,
            time: "16:32 22/01/2023"
        },
        {
            type: "user",
            text: "How are you?",
            name: nameVisitor,
            time: "16:32 22/01/2023"
        },
        {
            type: "Bot",
            text: "Im fine, thanks",
            name: "Assistance Bot",
            time: "16:32 22/01/2023"
        },
        {
            type: "user",
            text: "Whats your name?",
            name: nameVisitor,
            time: "16:35 22/01/2023"
        },
        {
            type: "Bot",
            text: "My name is Bot",
            name: "Assistance Bot",
            time: "16:35 22/01/2023"
        }
    ]
};
