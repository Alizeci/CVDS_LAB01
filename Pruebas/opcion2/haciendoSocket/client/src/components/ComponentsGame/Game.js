import React, { Component } from "react";
import PropTypes from "prop-types";
import { EAST, NORTH, WEST, SOUTH } from "./constantsGame";
import Board from "./Board";
import Tabs from "./Tabs";
import Pacman from "./Player/Pacman";
import { walking, changeDirection } from "./Player/moves";
import "./style.scss";
import "./../../css/App.css";

import io from "socket.io-client";
import queryString from "query-string";

let socket;
const ENDPOINT = "http://localhost:5000";

export default class Lacman extends Component {
  constructor(props) {
    super(props);

    const data = queryString.parse(props.location.search);
    //console.log("data: " + data.roomCode);

    this.handleKeyDown = this.handleKeyDown.bind(this); //Manejador de eventos

    //initialize socket state
    this.state = {
      room: data.roomCode,
      roomFull: false,
      users: [],
      currentUser: "",
      gameOver: false,
      winner: "",
      walkingTime: Date.now(),
      score: 0,
      ready: false,
      players: [],
      player: {
        id: "Player 0",
        position: [12.5, 15],
        direction: EAST,
        nextDirection: EAST,
      },
      lost: false,
      tabs: this.generateTabs(),
    };

    this.timers = {
      start: null,
      walking: null,
    };
  }

  initSocket() {
    const connectionOptions = {
      forceNew: true,
      reconnectionAttempts: "Infinity",
      timeout: 10000,
      transports: ["websocket"],
    };
    socket = io.connect(ENDPOINT, connectionOptions);

    socket.emit("join", { room: this.state.room }, (error) => {
      if (error) this.setState({ roomFull: true });
    });

    socket.on("initGameState", ({ gameOver, player }) => {
      this.setState({ gameOver: gameOver, player: player });
    });

    socket.on("roomData", ({ users }) => {
      this.setState({ users: users });
    });

    socket.on("currentUserData", ({ name }) => {
      console.log("Soy: " + name);
      this.setState({ currentUser: name });
    });
  }

  loadData() {
    window.addEventListener("keydown", this.handleKeyDown);

    // En players recibida
    socket.on("fire", ({ players }) => {
      this.setState({ players: players });
      // Reenviar la players a otros jugadores
      socket.emit("fire-reply", players.classList);
    });

    // En jugada recibida (Recibir movimiento de los demás jugadores)
    socket.on("move", ({ players }) => {
      this.setState({ players: players });

      // Notificar movimiento a los demás jugadores (Movimiento recibido)
      socket.emit("move-reply", players.classList);
    });
  }

  componentDidMount() {
    this.initSocket();
    this.loadData();

    //window.addEventListener("keydown", this.handleKeyDown);

    this.timers.start = setTimeout(() => {
      this.setState({ walkingTime: Date.now() });
      this.walkingInMap();
    }, 3000);
  }

  isBigTab([posX, posY]) {
    return (posX === 0 || posX === 25) && (posY === 7 || posY === 26);
  }

  generarNuevoColor() {
    var simbolos, color;
    simbolos = "0123456789ABCDEF";
    color = "#";

    for (var i = 0; i < 6; i++) {
      color = color + simbolos[Math.floor(Math.random() * 16)];
    }

    return color;
  }

  generateTabs() {
    const putRow = (startX, posY, num) =>
      new Array(num).fill(0).map((item, index) => [startX + index, posY]);

    const putSeparateTabsInRow = (xPoints, posY) =>
      xPoints.map((posX) => [posX, posY]);

    const putContinuousTabsInRow = (ranges, posY) =>
      ranges.reduce(
        (items, [startX, num]) => [...items, ...putRow(startX, posY, num)],
        []
      );

    const putCol = (posX, startY, num) =>
      new Array(num).fill(0).map((item, index) => [posX, startY + index]);

    const tabsGroup = [
      ...putRow(0, 0, 26),
      ...putSeparateTabsInRow([0, 11, 14, 25], 1),
      ...putSeparateTabsInRow([0, 11, 14, 25], 2),
      ...putContinuousTabsInRow(
        [
          [0, 6],
          [8, 4],
          [14, 4],
          [20, 6],
        ],
        3
      ),
      ...putSeparateTabsInRow([2, 5, 8, 17, 20, 23], 4),
      ...putSeparateTabsInRow([2, 5, 8, 17, 20, 23], 5),
      ...putContinuousTabsInRow(
        [
          [0, 3],
          [5, 7],
          [14, 7],
          [23, 3],
        ],
        6
      ),
      ...putSeparateTabsInRow([0, 5, 11, 14, 20, 25], 7),
      ...putSeparateTabsInRow([0, 5, 11, 14, 20, 25], 8),
      ...putContinuousTabsInRow(
        [
          [0, 12],
          [14, 12],
        ],
        9
      ),
      ...putCol(5, 10, 11),
      ...putCol(20, 10, 11),
      ...putContinuousTabsInRow(
        [
          [0, 6],
          [8, 4],
          [14, 4],
          [20, 6],
        ],
        21
      ),
      ...putSeparateTabsInRow([0, 5, 8, 17, 20, 25], 22),
      ...putSeparateTabsInRow([0, 5, 8, 17, 20, 25], 23),
      ...putRow(0, 24, 26),
      ...putSeparateTabsInRow([0, 5, 11, 14, 20, 25], 25),
      ...putSeparateTabsInRow([0, 5, 11, 14, 20, 25], 26),
      ...putSeparateTabsInRow([0, 5, 11, 14, 20, 25], 27),
      ...putContinuousTabsInRow(
        [
          [0, 12],
          [14, 12],
        ],
        28
      ),
    ];

    return tabsGroup.map((position, index) => ({
      key: index,
      position,
      eaten: false,
      big: this.isBigTab(position),
    }));
  }

  handleKeyDown(event) {
    if (event.key === "ArrowRight") {
      return this.changeDirection(EAST);
    }
    if (event.key === "ArrowUp") {
      return this.changeDirection(NORTH);
    }
    if (event.key === "ArrowLeft") {
      return this.changeDirection(WEST);
    }
    if (event.key === "ArrowDown") {
      return this.changeDirection(SOUTH);
    }
    return null;
  }

  createPlayer(currentUser) {
    const playersStock = [
      {
        id: "Player 1",
        position: [12.5, 18],
        direction: EAST,
        nextDirection: EAST,
      },
      {
        id: "Player 2",
        position: [12.5, 15],
        direction: WEST,
        nextDirection: WEST,
      },
      {
        id: "Player 3",
        position: [12.5, 15],
        direction: NORTH,
        nextDirection: NORTH,
      },
      {
        id: "Player 4",
        position: [12, 15],
        direction: NORTH,
        nextDirection: NORTH,
      },
    ];

    const found = playersStock.find((element) => element.id === currentUser);

    return found;
  }

  loadPlayers(currentUser) {
    const newPlayer = this.createPlayer(currentUser);

    if (this.state.users.length == 1) {
      this.state.players.push(newPlayer);
      this.setState({
        player: newPlayer,
        players: this.state.players,
      });
      // Notificar nuevos players
      socket.emit("fire", { players: this.state.players });
    } else {
      const found = this.state.players.find(
        (element) => element.id === currentUser
      );
      if (!found) {
        this.state.players.push(newPlayer);
        this.setState({
          player: newPlayer,
          players: this.state.players,
        });
        socket.emit("fire", { players: this.state.players });
      }
    }
  }

  changeDirection(direction) {
    this.loadPlayers(this.state.currentUser);

    this.setState(changeDirection(this.state, { direction }));

    this.setPositions();
    // Notificar movimiento a los demás jugadores
    socket.emit("move", { players: this.state.players });
  }

  setPositions() {
    for (let i = 0; i <= this.state.players.length - 1; i++) {
      if (this.state.currentUser == this.state.players[i].id) {
        this.state.players[i] = {
          id: this.state.player.id,
          position: [
            this.state.player.position[0],
            this.state.player.position[1],
          ],
          direction: this.state.player.direction,
          nextDirection: this.state.player.nextDirection,
        };
      }
    }
    this.setState({
      players: this.state.players,
    });
  }

  cleanup() {
    //cleanup on component unmount
    socket.emit("disconnection");
    //shut down connnection instance
    socket.off();
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    clearTimeout(this.timers.start);
    clearTimeout(this.timers.walking);
    return this.cleanup();
  }

  walkingInMap() {
    const move = walking(this.state);
    this.setState(move);

    clearTimeout(this.timers.walking);
    this.timers.walking = setTimeout(() => this.walkingInMap(), 20);
  }

  render() {
    const { onEnd, ...otherProps } = this.props;
    const props = { gridSize: 18, ...otherProps };

    const paintPlayers = this.state.players.map(({ id, ...playerN }) => (
      <Pacman
        key={id}
        {...props}
        {...playerN}
        lost={this.state.lost}
        onEnd={onEnd}
      />
    ));

    return (
      <div>
        {!this.state.roomFull ? (
          <>
            <div className="topInfo">
              <h1>Game Code: {this.state.room}</h1>
              <span>
                <button className="game-button green"></button>
              </span>
            </div>
            {this.state.users.length === 1 && (
              <h1 className="topInfoText">
                Waiting for Player 2 to join the game.
              </h1>
            )}
            {this.state.users.length === 2 && (
              <h1 className="topInfoText">
                Waiting for Player 3 to join the game.
              </h1>
            )}
            {this.state.users.length === 3 && (
              <h1 className="topInfoText">
                Waiting for Player 4 to join the game.
              </h1>
            )}

            {this.state.users.length === 2 && (
              <div>
                <h1 className="topInfoText">We are playing the game.</h1>
                <div className="lacman">
                  <Board {...props} />
                  <Tabs {...props} tabs={this.state.tabs} />
                  {paintPlayers}
                  {/* PLAYER 1 - VIEW */}
                  {this.state.currentUser === "Player 1" && (
                    <>
                      <div className="lacman-score p1">
                        <span className="running-score">
                          {"Score: "}
                          {this.state.score}
                        </span>
                      </div>
                    </>
                  )}
                  {/* PLAYER 2 - VIEW */}
                  {this.state.currentUser === "Player 2" && (
                    <>
                      <div className="lacman-score p2">
                        <span className="running-score">
                          {"Score: "}
                          {this.state.score}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <h1 className="serverFull">Room full</h1>
        )}

        <br />
        <a href="/">
          <button className="game-button red">QUIT</button>
        </a>
      </div>
    );
  }
}

Lacman.propTypes = {
  gridSize: PropTypes.number,
  onEnd: PropTypes.func,
};
