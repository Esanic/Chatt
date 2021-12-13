function evilInput (string){
    string = string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    return string;
}

let nickname = evilInput(prompt("Ange användarnamn"));
let socket = io();
socket.emit("nickname", nickname);

window.onload = () => {
    
    // Variabler
    let output = document.getElementById("output");
    let online = document.getElementById("online");
    let timeout;

    //Lyssnar på "userConnect" och broadcastar att användaren har anslutit.
    socket.on("userConnect", (data) => {
        const userConnect = document.createElement("p")
        userConnect.setAttribute("class","connect");
        userConnect.innerHTML = `${data} har anslutit till servern! Välkommen!`;
        output.appendChild(userConnect);
    });
    
    //Lyssnar på "userDisconnect" och broadcastar att användaren har disconnectat.
    socket.on("userDisconnect", (data) => {
        const userDisconnect = document.createElement("p")
        userDisconnect.setAttribute("class","disconnect");
        userDisconnect.innerHTML = `${data} har lämnat oss, hejdå!`;
        output.appendChild(userDisconnect);
    })

    //Lyssnar på "onlineUsers", nollställer innehållet i "online" och skriver ut varje element i arrayen "data"
    socket.on("onlineUsers", (data) => {
        online.innerHTML = "";
        online.innerHTML = `<h3 id="onlineHeader">Online</h3>`;
        for(i=0; i<data.length;i++) {
            const onlineList = document.createElement("p");
            onlineList.setAttribute("class","onlineList");
            onlineList.innerHTML = `${data[i]}`;
            online.appendChild(onlineList);
        }

    })

    //Chattmeddelanden
    const otherChatt = document.createElement("p");
    otherChatt.setAttribute("class","otherChatt");
    
    function enter() {
        let message = document.getElementById("chattInput").value;
        let cleansedMessage = evilInput(message);
        
        if (!cleansedMessage == "") {
        let messageObject = {meddelande: cleansedMessage, användare: nickname}
        let typingObject = {isTyping: false};
        socket.emit("chattMessage", messageObject);
        socket.emit("userTyping", typingObject);

        document.getElementById("chattInput").value = "";
        let tid = new Date().toISOString().substr(11,8);
        const meChatt = document.createElement("p");
        meChatt.setAttribute("class","meChatt");
        meChatt.innerHTML = `(${tid}) ${nickname}: ${cleansedMessage}`
        output.appendChild(meChatt);
        output.lastElementChild.scrollIntoView({ behavior: 'smooth' });
        }
        else {
        document.getElementById("nm").innerHTML =`Skriv ett meddelande!`;
        }
    }
    //Hämtar ChattForm och lyssnar på submit, hindrar omladdning
    //Sparar värdet av chattInput i message, skapar ett objekt som emittar användarnamn och meddelande
    //Nollställer userTyping med hjälp av false
    document.getElementById("chattForm").addEventListener("submit", (event) => {
        event.preventDefault();
        enter();
    })
    
    //Skriver ut chattmeddelandet för alla anslutna klienter
    socket.on("chattMessage", (data)=>{
        const message = data.meddelande;
        const nickname = data.användare;
        const tid = new Date().toISOString().substr(11,8);

        const otherChatt = document.createElement("p");
        otherChatt.setAttribute("class","otherChatt");
        otherChatt.innerHTML = `(${tid}) ${nickname}: ${message}`
        output.appendChild(otherChatt);
        output.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    });
    
    //User is typing
    function timeOut() {
        typing = false;
        socket.emit("userTyping", typing);
    }

    document.getElementById("chattInput").addEventListener("keypress", (e) => {
        
        document.getElementById("nm").innerHTML = "";
        
        if (e.key === 'Enter') {
            e.preventDefault();
            enter();
            let userTyping = false;
            let object = {isTyping: userTyping};
            socket.emit("userTyping", object);
        }
        else {
            let userTyping = true;
            let object = {användare: nickname, isTyping: userTyping};
            socket.emit("userTyping", object);
            clearTimeout(timeout);
            timeout = setTimeout(timeOut, 1000);
        }
        
    });

    // const typingContainer = document.createElement("div");
    // typingContainer.setAttribute("id","typingContainer");
    
    let typingContainer = document.getElementById("typingContainer");

    const userTyping = document.createElement("p");
    userTyping.setAttribute("id", "userTyping");
    
    // output.appendChild(typingContainer);
    typingContainer.appendChild(userTyping);
    
    socket.on("userTyping", (data) => {
        const nickname = data.användare;
        const typing = data.isTyping;
        
        if (typing == true) {
            userTyping.innerHTML = `${nickname} skriver...`;
            typingContainer.replaceChild(userTyping, userTyping);
        }
        else {
            userTyping.innerHTML = "";
            typingContainer.replaceChild(userTyping, userTyping);
        }

    });
}