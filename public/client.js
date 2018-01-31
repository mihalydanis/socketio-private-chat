const myUsername = window.username;
const conversationDOM = document.getElementById('conversation');
const usersDOM = document.getElementById('users');
const messageDOM = document.getElementById("message");
const messageButtonDOM = document.getElementById("message-send");

document.addEventListener('DOMContentLoaded', () => {
  messageDOM.focus();

  messageButtonDOM.addEventListener("click", (e) => {
    sendMessage();
  });

  messageDOM.addEventListener("keydown", (e) => {
    if (e.which === 13) {
      e.preventDefault();
      sendMessage();
    }
  });
});

var socket = io.connect();

function openPrivateChat(url) {
  // url = 'private';
  // const win = window.open('/' + url, '_blank');
  // win.focus();

  socket.emit('joinPrivateRoom', myUsername, 'private');
}

function sendIndividualMsg(id) {
  socket.emit('privateMessage', myUsername, id);
}

function sendMessage() {
  const message = messageDOM.value;

  if (message === '' || message.length === 0) { 
    return false; 
  }

  messageDOM.value = '';
  socket.emit('sendMessage', message);
  messageDOM.focus();
}

socket.on('connect', () => {
  socket.emit('join', myUsername);
});

socket.on('updateMessages', (from, to, data) => {
  var msg = document.createElement("span");
  msg.innerHTML = `<b>${from} -> ${to}:</b> ${data}<br>`;
  conversationDOM.appendChild(msg);
});

socket.on('userFound', (username) => {
  socket.emit('messageUser', username, myUsername, prompt('Type your message:'));
});

socket.on('updateChat', (username, message) => {
  let msg = document.createElement("span");
  msg.innerHTML = `<b>${username}:</b> ${message}<br>`;
  conversationDOM.appendChild(msg);
});

socket.on('updateChatHistory', (chatHistories) => {
  chatHistories.forEach((item) => {
    let msg = document.createElement("span");
    msg.innerHTML = `<b>${item.user}:</b> ${item.message}<br>`;
    conversationDOM.appendChild(msg);
  });
});

socket.on('updateUsers', (users) => {
  usersDOM.innerHTML = '';

  for (var key in users) {
    let user = document.createElement("span");
    user.innerHTML = `<div class="user" onclick="openPrivateChat('${users[key]}')">${key}</div>`;
    usersDOM.appendChild(user);
  }
});
