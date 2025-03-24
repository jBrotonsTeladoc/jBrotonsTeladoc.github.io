const liveAgentEndpoint = 'https://d.la12s-core1.sfdc-8tgtt5.salesforceliveagent.com/chat/rest/';
const liveAgentVersion = '60';
const nameVisitor = 'Alexander Gimenez';
let sequence = 1;
let affinityToken = null;
let sessionId = null;
let sessionKey = null;

// Iniciar el proceso
getSessionId();

function sendCustomEventWithSequence(customSequence) {
    const customEventUrl = `${liveAgentEndpoint}Chasitor/CustomEvent`;
    
    const customEventData = {
        type: "Attachment",
        data: `TEST_WITH_CUSTOM_SEQUENCE_${customSequence}`
    };
    
    console.log(`Enviando evento personalizado con secuencia personalizada: ${customSequence} (secuencia real: ${sequence})`);
    
    // Crear headers con secuencia personalizada
    const headers = {
        'X-LIVEAGENT-API-VERSION': liveAgentVersion,
        'X-LIVEAGENT-AFFINITY': affinityToken || 'null',
        'X-LIVEAGENT-SESSION-KEY': sessionKey,
        'X-LIVEAGENT-SEQUENCE': customSequence.toString()
    };
    
    return fetch(customEventUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(customEventData)
    })
    .then(response => {
        console.log(`Respuesta del servidor para secuencia ${customSequence}:`, response.status);
        return response.text();
    })
    .then(text => {
        console.log(`Texto de respuesta para secuencia ${customSequence}:`, text);
        return text;
    })
    .catch(error => {
        console.error(`Error al enviar con secuencia ${customSequence}:`, error);
        throw error;
    });
}

// Función para probar con una secuencia menor
function testLowerSequence() {
    // Guardar la secuencia actual
    const actualSequence = sequence;
    // Probar con una secuencia menor (siempre 1)
    const lowerSequence = 1;
    
    console.log(`🧪 PRUEBA: Enviando con secuencia menor ${lowerSequence} (actual: ${actualSequence})`);
    
    sendCustomEventWithSequence(lowerSequence)
        .then(response => {
            console.log(`✅ Respuesta recibida para prueba con secuencia ${lowerSequence}:`, response);
            
            // Verificar mensajes después de un tiempo
            setTimeout(() => {
                const messagesUrl = `${liveAgentEndpoint}System/Messages`;
                apiCall(messagesUrl, 'GET')
                    .then(data => {
                        console.log('Mensajes después de prueba con secuencia menor:', data);
                        if (data && data.customEvents && data.customEvents.length > 0) {
                            console.log('✅ Eventos personalizados encontrados:', data.customEvents);
                        } else {
                            console.log('❌ No se encontraron eventos personalizados');
                        }
                    });
            }, 3000);
        })
        .catch(error => {
            console.log(`❌ Error en prueba con secuencia ${lowerSequence}:`, error);
        });
}

// Función para probar con una secuencia aleatoria
function testRandomSequence() {
    // Generar un número aleatorio entre 1 y 100
    const randomSequence = Math.floor(Math.random() * 100) + 1;
    const actualSequence = sequence;
    
    console.log(`🧪 PRUEBA: Enviando con secuencia aleatoria ${randomSequence} (actual: ${actualSequence})`);
    
    sendCustomEventWithSequence(randomSequence)
        .then(response => {
            console.log(`✅ Respuesta recibida para prueba con secuencia ${randomSequence}:`, response);
            
            // Verificar mensajes después de un tiempo
            setTimeout(() => {
                const messagesUrl = `${liveAgentEndpoint}System/Messages`;
                apiCall(messagesUrl, 'GET')
                    .then(data => {
                        console.log('Mensajes después de prueba con secuencia aleatoria:', data);
                        if (data && data.customEvents && data.customEvents.length > 0) {
                            console.log('✅ Eventos personalizados encontrados:', data.customEvents);
                        } else {
                            console.log('❌ No se encontraron eventos personalizados');
                        }
                    });
            }, 3000);
        })
        .catch(error => {
            console.log(`❌ Error en prueba con secuencia ${randomSequence}:`, error);
        });
}

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
    
    // Usar promesas para asegurar el orden correcto de operaciones
    sendMessageSF(message)
        .then(() => {
            // Sólo enviar el evento personalizado después de que el mensaje se haya enviado
            // y la secuencia se haya incrementado correctamente
            return sendCustomEvent();
        })
        .catch(error => {
            console.error('Error en el proceso de envío:', error);
        });
    
    document.getElementById("userMessage").value = "";
}

function createSFChatMessage(message){
    newMessageInChat("messageSF", message);
}

function createHeaders() {
    // Crear headers con los valores actuales
    return {
        'X-LIVEAGENT-API-VERSION': liveAgentVersion,
        'X-LIVEAGENT-AFFINITY': affinityToken || 'null',
        'X-LIVEAGENT-SESSION-KEY': sessionKey,
        'X-LIVEAGENT-SEQUENCE': sequence.toString() // Asegurar que sea string
    };
}

function apiCall(url, method, body = null) {
    console.log(`Realizando llamada API a ${url} con secuencia ${sequence}`);
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
    console.log(`Realizando llamada API TEXT a ${url} con secuencia ${sequence}`);
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
    apiCall(url, 'GET')
        .then(data => {
            affinityToken = data.affinityToken;
            sessionId = data.id;
            sessionKey = data.key;
            console.log('Resultado de getSessionId:', data);
            
            // No incrementamos sequence aquí ya que es la llamada inicial
            
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
                            text: "Hi! I'm your Health Assistant.\n\nI'm great at getting you to the right Teladoc service to suit your needs, answering billing and service questions, and taking feedback about your experience. If this is an emergency, please go to your nearest emergency room or call 911.\n\nWhat can I help you with today?",
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
                            text: "I understand you want to talk to a person. However, I can also help you with getting you to the right service or FAQ page and save you time.\nCan you tell me about the nature of your request?",
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
            sequence++; // Incrementar sequence después de la llamada exitosa
            console.log('Resultado de initiateChat:', response);
            
            // Iniciar el polling de mensajes después de inicializar el chat
            receiveSFMessages();
        })
        .catch(error => console.error('Error al iniciar chat:', error));
}

function sendMessageSF(message) {
    const chatMessageUrl = `${liveAgentEndpoint}Chasitor/ChatMessage`;
    
    return apiCallText(chatMessageUrl, 'POST', {text: message})
        .then(response => {
            sequence++; // Incrementar sequence después de la llamada exitosa
            console.log('Resultado de mensaje:', response);
            return response; // Devolver la respuesta para encadenar promesas
        })
        .catch(error => {
            console.error('Error al enviar mensaje:', error);
            throw error; // Re-lanzar el error para manejo adecuado
        });
}

function sendCustomEvent() {
    const customEventUrl = `${liveAgentEndpoint}Chasitor/CustomEvent`;
    
    // Probar con distintos formatos
    const customEventData = {
        type: "Attachment",
        data: "TEST_ATTACHMENT_DATA" // String simple y claro
    };
    
    console.log('Enviando evento personalizado:', JSON.stringify(customEventData), 'Secuencia actual:', sequence);
    
    return apiCallText(customEventUrl, 'POST', customEventData)
        .then(response => {
            sequence++; // Incrementar sequence después de la llamada exitosa
            console.log('Respuesta del evento personalizado:', response);
            
            // Verificar el evento después de un breve retraso
            setTimeout(checkCustomEvent, 3000);
            
            return response;
        })
        .catch(error => {
            console.error('Error al enviar custom event:', error);
            throw error;
        });
}

function checkCustomEvent() {
    const messagesUrl = `${liveAgentEndpoint}System/Messages`;
    apiCall(messagesUrl, 'GET')
        .then(data => {
            console.log('Verificando mensajes después del evento personalizado:', data);
            // Buscar específicamente eventos personalizados en la respuesta
            if (data && data.customEvents && data.customEvents.length > 0) {
                console.log('✅ Eventos personalizados encontrados:', data.customEvents);
            } else {
                console.log('❌ No se encontraron eventos personalizados en la respuesta');
            }
        })
        .catch(err => console.error('Error al verificar mensajes:', err));
}

async function receiveSFMessages() {
    await sleep(5000);
    const url = `${liveAgentEndpoint}System/Messages`;
    
    // Para el polling NO incrementamos sequence
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
            // Verificar si hay eventos personalizados
            if (data && data.customEvents && data.customEvents.length > 0) {
                console.log('✅ Eventos personalizados recibidos:', data.customEvents);
            }
            // Programar la próxima verificación
            receiveSFMessages();
        })
        .catch(error => {
            console.error('Error al obtener mensaje de sesión:', error);
            // Intentar nuevamente después de un tiempo
            setTimeout(receiveSFMessages, 5000);
        });
}

function exitChat() { 
    const chatEndUrl = `${liveAgentEndpoint}Chasitor/ChatEnd`;
    apiCallText(chatEndUrl, 'POST', {reason: "client"})
        .then(response => {
            sequence++; // Incrementar sequence después de la llamada exitosa
            console.log('Resultado de cerrarChat:', response);
        })
        .catch(error => console.error('Error al cerrar chat:', error));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Datos de prueba
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
};
