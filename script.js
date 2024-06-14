document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('chat-form').addEventListener('submit', function(event) {
        event.preventDefault();
        var input = document.getElementById('chat-input');
        userMessage(input.value)
        input.value = '';
    });


    document.getElementById('start-button').addEventListener('click', () => {
        document.getElementById('popup').style.display = 'none';
        document.getElementById('container').style.display = '';
        addMessageToChat('agent','Hello, how are you? Could you tell me what symptoms you have?')
        playNewVideo('resource/init_video.mp4');
    })


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
        messages.push({"role":type,"content":message});
    }

    const micButton = document.getElementById('mic-button');
    const responseInput = document.getElementById('chat-input');
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
            document.getElementById('mic-img').src = 'resources/no_voice.png'
        };

        recognition.onend = function() {
            recognizing = false;
            userMessage(responseInput.value)
            document.getElementById('mic-img').src = 'resources/on_voice.png'
            responseInput.value = ''
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

        const requestBody = {
            messages: messages
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
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

    const videoElement = document.getElementById('background-video');
    
    if (!videoElement) {
        console.error("Elemento de video no encontrado");
        return;
    }

    const player = videojs(videoElement);

    function playNewVideo(videoUrl) {
        player.pause();
        player.src({ type: 'video/mp4', src: videoUrl });
        player.loop(false);
        player.muted(false);
        player.play();
    }

    player.on('ended', () => {
        player.pause();
        player.src({ type: 'video/mp4', src: 'resource/wait_video_'+getRandomInt(2)+'.mp4' });
        player.loop(true);
        player.muted(true);
        player.play();
    });

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }
});
