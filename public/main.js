document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('messageInput');
  const messageContainer = document.getElementById('message-container');
  const nameInput = document.getElementById('nameInput');
  const clientsTotal = document.getElementById('clients-total');

  let myName = '';

  socket.on('clients-total', (count) => {
    clientsTotal.innerText = `Total clients: ${count}`;
  });

  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    

    if (!myName) {
      myName = nameInput.value.trim();
      if (!myName) return alert('Please enter your name');
    }

    sendMessage();
  });

  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const data = {
      name: myName,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };

    socket.emit('message', data);
    messageInput.value = '';
  }

  socket.on('message', (data) => {
    const isOwn = data.name === myName;
    addMessage(isOwn, data);
  });

  function addMessage(isOwn, data) {
    const li = document.createElement('li');
    li.classList.add(isOwn ? 'message-right' : 'message-left');

    const p = document.createElement('p');
    p.classList.add('message');
    p.innerText = data.message;

    const span = document.createElement('span');
    span.innerText = `${data.name} • ${data.timestamp}`;

    p.appendChild(span);
    li.appendChild(p);
    messageContainer.appendChild(li);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
});



const feedback = document.getElementById('feedback');

// Send feedback events
messageInput.addEventListener('focus', () => {
    socket.emit('feedback', {
        feedback: `${nameInput.value} is typing...`
    });
});




