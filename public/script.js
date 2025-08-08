socket.on('message-history', (messages) => {
  messages.forEach((msg) => {
    addMessageToUI(msg.name, msg.message); // adjust this based on your existing UI rendering function
  });
});
