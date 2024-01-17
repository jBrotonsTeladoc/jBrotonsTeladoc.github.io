// Define las constantes con tus datos de configuración
const liveAgentEndpoint = 'tu_endpoint_de_live_agent'; // Reemplaza con tu endpoint
const liveAgentVersion = '34'; // La versión de la API de Live Agent

// 1. Obtener un ID de sesión
function getSessionId() {
    const url = `${liveAgentEndpoint}/chat/rest/System/SessionId`;
    const headers = {
        'X-LIVEAGENT-API-VERSION': liveAgentVersion,
        'X-LIVEAGENT-AFFINITY': 'null'
    };

    fetch(url, { headers: headers })
        .then(response => response.json())
        .then(data => {
            // Usa los datos de la sesión (data) para realizar la siguiente solicitud
            sendChatRequest(data);
        })
        .catch(error => console.error('Error al obtener el ID de sesión:', error));
}

// 2. Enviar una solicitud de chat
function sendChatRequest(sessionData) {
    const url = `${liveAgentEndpoint}/chat/rest/Chasitor/ChasitorInit`;
    const headers = {
        'X-LIVEAGENT-API-VERSION': liveAgentVersion,
        'X-LIVEAGENT-AFFINITY': sessionData.affinityToken,
        'X-LIVEAGENT-SESSION-KEY': sessionData.key,
        'X-LIVEAGENT-SEQUENCE': '1'
    };
    const payload = {
        // Completa con tus datos específicos
    };

    fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    })
        .then(/* manejo de la respuesta de la solicitud de chat */)
        .catch(error => console.error('Error al enviar solicitud de chat:', error));
}


// Función para realizar polling y recibir mensajes
function pollMessages(affinityToken, sessionKey) {
    const url = `${liveAgentEndpoint}/chat/rest/System/Messages`;
    const headers = {
        'X-LIVEAGENT-API-VERSION': liveAgentVersion,
        'X-LIVEAGENT-AFFINITY': affinityToken,
        'X-LIVEAGENT-SESSION-KEY': sessionKey
    };

    setInterval(() => {
        fetch(url, { headers: headers })
            .then(response => response.json())
            .then(data => {
                // Procesa los mensajes recibidos
                console.log('Mensajes recibidos:', data);
            })
            .catch(error => console.error('Error al recibir mensajes:', error));
    }, 5000); // Intervalo de polling, aquí está configurado a 5 segundos
}

// Llamar a esta función después de iniciar una sesión de chat y obtener el affinityToken y el sessionKey


// Inicia el proceso
getSessionId();
