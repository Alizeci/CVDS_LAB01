const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const express = require("express");
const path = require("path");
const http = require("http");
const PORT = process.env.PORT || 5000;
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

io.on("connection", (socket) => {
  socket.on("join", (payload, callback) => {
    let numberOfUsersInRoom = getUsersInRoom(payload.room).length;
    console.log("Usuarios en la sala: " + numberOfUsersInRoom);

    const { error, newUser } = addUser({
      id: socket.id,
      name:
        numberOfUsersInRoom === 0
          ? "Player 1"
          : "Player " + (numberOfUsersInRoom + 1),
      room: payload.room,
    });
    //console.log("En Sala: " + newUser.name);

    if (error) return callback(error);

    socket.join(newUser.room);
    console.log("usuario unido: " + newUser.id);

    io.to(newUser.room).emit("roomData", {
      room: newUser.room,
      users: getUsersInRoom(newUser.room),
    });
    socket.emit("currentUserData", { name: newUser.name });
    callback();
  });

  socket.on("initGameState", (gameState) => {
    const user = getUser(socket.id);
    if (user) io.to(user.room).emit("initGameState", gameState);
  });

  // En playersList recibida
  socket.on("fire", (players) => {
    console.log("En server asignando player");
    const user = getUser(socket.id);

    // Reenviar la playersList a otros jugadores
    if (user) socket.broadcast.emit("fire", players);
    console.log("Received from : " + players);
  });

  // En respuesta a playersList recibida
  socket.on("fire-reply", (playersReceived) => {
    const user = getUser(socket.id);
    // Reenviar la respuesta de playersList a otros jugadores
    if (user) socket.broadcast.emit("fire-reply", playersReceived);
    console.log("¿It's Received?: " + playersReceived);
  });

  // En jugada recibida
  socket.on("move", (players) => {
    console.log("En fire server");
    const user = getUser(socket.id);

    // Reenviar la jugada a otros jugadores
    if (user) socket.broadcast.emit("move", players);
    console.log("Received from : " + players);
  });

  // En respuesta a la jugada recibida
  socket.on("move-reply", (playerReceived) => {
    const user = getUser(socket.id);
    // Reenviar la respuesta de la jugada a otros jugadores
    if (user) socket.broadcast.emit("move-reply", playerReceived);
    console.log("¿It's Received?: " + playerReceived);
  });

  socket.on("disconnection", () => {
    const user = removeUser(socket.id);
    if (user)
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
  });
});

//serve static assets in production
if (process.env.NODE_ENV === "production") {
  //set static folder
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
