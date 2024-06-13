document.getElementById('chat-form').addEventListener('submit', function(event) {
    event.preventDefault();
    var input = document.getElementById('chat-input');
    var message = input.value;
    if (message.trim() !== '') {
        addMessageToChat('sent', message);
        input.value = '';
    }
    var response = generateResponse();
});

document.getElementById('chat-response').addEventListener('submit', function(event) {
    event.preventDefault();
    const input = document.getElementById('response-input');
    const message = input.value;
    if (message.trim() !== '') {
        addMessageToChat('received', message);
        input.value = '';
    }
});

function addMessageToChat(type, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', type);
    messageElement.textContent = message;
    console.log((message.length*2+3));
    messageElement.style.width = (message.length*8.15) + 'px';
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

const micButton = document.getElementById('mic-button');
const responseInput = document.getElementById('chat-response');
let recognizing = false;
let recognition;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onstart = function() {
        recognizing = true;
        micButton.classList.add('active');
        micButton.textContent = '🔴';
    };

    recognition.onend = function() {
        recognizing = false;
        micButton.classList.remove('active');
        if (responseInput.value.trim() !== '') {
            addMessageToChat('sent', responseInput.value);
            responseInput.value = '';
        }
        micButton.textContent = '🎤';
    };

    recognition.onresult = function(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        responseInput.value = finalTranscript || interimTranscript;
    };
}

micButton.addEventListener('click', function() {
    if (recognizing) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

const azureKey = 'fvgyP2xTbhnH-Uq5J36NKbGB9FZGwfK1-tT4FuDn3n5PAzFugBHanw=='; 

function generateResponse() {
    fetch(`https://laia-backend.azurewebsites.net/api/generate\?code=${azureKey}`)
        .then(response => {
            console.log('RESPONSE:')
            console.log(response)
            console.log(JSON.stringify(response))
        })
        .then(data => {
            console.log('DATA:')
            console.log(data)
            console.log(JSON.stringify(data))
            console.log(data)
            addMessageToChat('received', response);
        })
        .catch(error => console.error('Error:', error));
}