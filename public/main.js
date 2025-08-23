document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('messageInput');
  const messageContainer = document.getElementById('message-container');
  const nameInput = document.getElementById('nameInput');
  const clientsTotal = document.getElementById('clients-total');
  const feedback = document.getElementById('feedback');

  let myName = '';

  // Update total clients
  socket.on('clients-total', (count) => {
    clientsTotal.innerText = `Total clients: ${count}`;
  });

  // Handle form submission
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Name validation
    if (!myName) {
      myName = nameInput.value.trim();
      if (!myName) {
        feedback.innerText = '⚠️ Please enter your name before sending a message!';
        return; // prevent sending message
      }
    }

    sendMessage();
  });

  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const data = {
      name: myName,
      message,
      timestamp: new Date(),
      id: socket.id
    };

    socket.emit('message', data);
    messageInput.value = '';
    feedback.innerText = '';
  }

  // Receive new messages
  socket.on('message', (data) => {
    const isOwn = data.id === socket.id;
    addMessage(isOwn, data);
  });

  function addMessage(isOwn, data) {
    const li = document.createElement('li');
    li.classList.add(isOwn ? 'message-right' : 'message-left');

    const p = document.createElement('p');
    p.classList.add('message');
    p.innerText = data.message;

    const span = document.createElement('span');
    const date = new Date(data.timestamp);
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    span.innerText = `${data.name} • ${formattedTime}`;

    p.appendChild(span);
    li.appendChild(p);
    messageContainer.appendChild(li);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  // Typing indicator
  let typingTimeout;
  messageInput.addEventListener('input', () => {
    if (messageInput.value.trim().length > 0) {
      socket.emit('typing', { name: myName || nameInput.value });

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit('stopTyping');
      }, 1500);
    } else {
      socket.emit('stopTyping');
    }
  });

  socket.on('typing', (data) => {
    feedback.innerText = `${data.name} is typing...`;
  });

  socket.on('stopTyping', () => {
    feedback.innerText = '';
  });

  // Handle backend error for empty names
  socket.on('error-message', (msg) => {
    feedback.innerText = `⚠️ ${msg}`;
  });
});
