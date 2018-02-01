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

const socket = io.connect();

function getFormattedDate(date = null) {
  const newDate = date ? new Date(date) : new Date();

  let formattedDate = '';

  formattedDate += ("0" + (newDate.getMonth() + 1)).slice(-2) + "-";  
  formattedDate += ("0" + newDate.getDate()).slice(-2) + " ";
  formattedDate += ("0" + newDate.getHours()).slice(-2) + ":";
  formattedDate += ("0" + newDate.getMinutes()).slice(-2) + ":";
  formattedDate += ("0" + newDate.getSeconds()).slice(-2);

  return formattedDate;
}

function appendMessageToChat(username, message, systemMessage = false) {
  console.log(systemMessage)
  let msg = document.createElement("span");
  let messageText = '';
  if (systemMessage === true) {
    console.log('bejottem true')
    messageText = `<div class="system-message"><b>***</b> ${message}</div>`;
  } else {
    messageText = `<b>${username}:</b> ${message}`;
  }
  msg.innerHTML = `<div class="date">[${getFormattedDate()}]</div>${messageText}<br>`;
  conversationDOM.appendChild(msg);
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

socket.on('addMessage', (username, message) => {
  appendMessageToChat(username, message);
});

socket.on('systemMessage', (message) => {
  let systemMessage = true;
  let username = null;
  appendMessageToChat(username, message, systemMessage);
});

socket.on('renderChatHistory', (chatHistories) => {
  conversationDOM.innerHTML = '';
  chatHistories.forEach((history) => {
    let msg = document.createElement("span");
    msg.innerHTML = `<div class="date">[${getFormattedDate(history.ts)}]</div><b>${history.user}:</b> ${history.message}<br>`;
    conversationDOM.appendChild(msg);
  });
});

socket.on('renderUsers', (users) => {
  usersDOM.innerHTML = '';

  for (let key in users) {
    let user = document.createElement("span");
    user.innerHTML = `<div class="user" onclick="openPrivateChat('${users[key]}')">${key}</div>`;
    usersDOM.appendChild(user);
  }
});
