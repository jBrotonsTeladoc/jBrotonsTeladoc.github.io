const liveAgentEndpoint = 'https://d.la4-c1cs-ia5.salesforceliveagent.com/chat/rest/';
const liveAgentVersion = '60';
let sequence = 0;
let affinityToken = null;
let sessionId = null;
let sessionKey = null;

getSessionId();


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
        sequence++;
        return response.json();
    });
}

// Las funciones sendMessage, receiveSFMessages, y createSFChatMessage permanecen iguales

function getSessionId() {
    const url = `${liveAgentEndpoint}System/SessionId`;
    apiCall(url, 'GET')
        .then(data => {
            affinityToken = data.affinityToken;
            sessionId = data.id;
            sessionKey = data.key;
            console.log('Resultado de getSessionId:', data);
            initiateChat(data);
        })
        .catch(error => console.error('Error al obtener el ID de sesión:', error));
}

function initiateChat(sessionData) {
    const chatInitUrl = `${liveAgentEndpoint}Chasitor/ChasitorInit`;
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

    apiCall(chatInitUrl, 'POST', chatInitData)
        .then(response => {receiveSFMessages();console.log('Resultado de initiateChat:', response);})
        .catch(error => console.error('Error al iniciar chat:', error));
}

function sendMessageSF(message) {
    const chatMessageUrl = `${liveAgentEndpoint}Chasitor/ChatMessage`;
    const bodyMessage = { text: message };
    console.log(bodyMessage)

    apiCall(chatMessageUrl, 'POST', bodyMessage)
        .then(response => console.log('Resultado de mensaje:', response))
        .catch(error => console.error('Error al enviar mensaje:', error));
}

function exitChat() {
    const chatEndUrl = `${liveAgentEndpoint}Chasitor/ChatEnd`;
    apiCall(chatEndUrl, 'POST', {reason: "client"})
        .then(response => console.log('Resultado de cerrarChat:', response))
        .catch(error => console.error('Error al cerrar chat:', error));
}