const liveAgentEndpoint = 'https://d.la12s-core1.sfdc-8tgtt5.salesforceliveagent.com/chat/rest/'; // Reemplaza con tu endpoint
const liveAgentVersion = '60'; // La versión de la API de Live Agent
const nameVisitor = 'Alexander Gimenez'; // Nombre del visitante
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
        deploymentId: "5728J000000004q",
        buttonId: "5738J000000005F",
        sessionId: sessionId,
        visitorName: nameVisitor,
        prechatDetails: [
            {
            label: "Email",
            value: "alexander.gimenez@teladochealth.com",
            transcriptFields: [
                    "c__EmailAddress"
            ],
            displayToAgent: true 
            },
            {
                "label": "LastName",
                "value": "Alex Gimenez",
                "transcriptFields": [
                        "c__LastName"
                ],
                "displayToAgent": true 
            },
            {
                label: "Transcript",
                value: JSON.stringify(prechatValue),
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
    await sleep(5000);
    const url = `${liveAgentEndpoint}System/Messages`;
    apiCall(url,'GET')
        .then(data => {
            console.log('Resultado de mensaje:', data);
            if(data != undefined && data != '' && data.messages.length > 0){
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

const prechatValue = {
    messages : [
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
}

