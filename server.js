const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
server.listen(3000);
console.log("Server running at Localhost:3000");
const { Server } = require("socket.io");
const io = new Server(server);

app.use (express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/socket.html");
})

let connectedUsers = [];

io.on("connection", (socket) => {

    socket.on("nickname", (data) => {
        socket.user = data;
        connectedUsers.push(data);
        socket.broadcast.emit("userConnect", socket.user);
        io.emit("onlineUsers", connectedUsers);
    })

    socket.on("disconnect", () => {
        connectedUsers = connectedUsers.filter(item => item !== socket.user);
        socket.broadcast.emit("userDisconnect", socket.user);
        socket.broadcast.emit("onlineUsers", connectedUsers);
    });

    socket.on("userTyping", (data) => {
        socket.broadcast.emit("userTyping", data);
    });

    socket.on("chattMessage", (data) => {
        socket.broadcast.emit("chattMessage", data);
    });
});


