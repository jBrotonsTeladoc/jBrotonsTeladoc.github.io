document.getElementById('chat-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    const message = input.value;
    if (message.trim() !== '') {
        addMessageToChat('sent', message);
        input.value = '';
    }
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