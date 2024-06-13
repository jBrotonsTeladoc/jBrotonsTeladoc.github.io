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