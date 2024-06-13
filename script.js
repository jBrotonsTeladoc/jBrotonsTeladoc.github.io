document.getElementById('chat-form').addEventListener('submit', function(event) {
    event.preventDefault();
    var input = document.getElementById('chat-input');
    userMessage(input.value)
    input.value = '';
});


function userMessage(message){
    if (message.trim() !== '') {
        addMessageToChat('user', message);
    }
     generateResponse();
}

function addMessageToChat(type, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', type);
    messageElement.textContent = message;
    messageElement.style.width = (message.length*8.15) + 'px';
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    messages.push({"type":type,"text":message});
}

const micButton = document.getElementById('mic-button');
const responseInput = document.getElementById('chat-response');
let recognizing = false;
let recognition;
let messages = [];

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
        userMessage(responseInput.value)
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


function generateResponse() {
    const azureKey = 'fvgyP2xTbhnH-Uq5J36NKbGB9FZGwfK1-tT4FuDn3n5PAzFugBHanw=='; 
    const url = `https://laia-backend.azurewebsites.net/api/generate?code=${azureKey}`;
    console.log(messages);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            console.log('DATA:', data);
            addMessageToChat('agent', data); // Asegúrate de que `addMessageToChat` maneje la cadena JSON
        })
        .catch(error => console.error('Error:', error));
}
const player = videojs(document.getElementById('background-video'));

playNewVideo('resource/init_video.mp4')

function playNewVideo(videoUrl) {
    player.src({ type: 'video/mp4', src: videoUrl });
    player.loop(false);
    player.muted(false);
    player.play();
}

player.on('ended', () => {
    player.src({ type: 'video/mp4', src: 'wait_video.mp4' });
    player.loop(true);
    player.muted(true);
    player.play();
});

