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
    console.log("data: " + data.roomCode);

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
      player: {
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

    /*socket.emit("keydown", { players: this.state.players }, (error) => {
      console.log("Player Number moved: " + player.id);
      players = this.state.players;
      userName = "";
      
      vel = handleKeyDown(event);
      const newPlayers = (players) => players.forEach(player => {
        console.log(item);
        if(player.id === this.state.currentUser){
          userName = this.state.currentUser
        }
      });
      if (newPlayers) {
        this.setState({ players: newPlayers });
        state[roomName].players[client.number - 1].vel = vel;
      }
    });*/
    /*
    socket.emit("keydown", ({ keyCode }) => {
      if (this.state.currentUser) {
        console.log(
          "Player Number moved: " +
            this.state.currentUser +
            " " +
            parseInt(keyCode)
        );
        let vel = this.handleKeyDown(keyCode);
        console.log("vel: " + vel);

        if (vel) {
          this.setState({ players: this.state.players });
        }
      }

      /*let playersS = this.state.players;
      let userName = "";
      console.log(playersS);

      const newPlayers = (players) =>
        players.forEach((player) => {
          console.log(player);
          if (player.id === this.state.currentUser) {
            userName = this.state.currentUser;
            let vel = this.handleKeyDown(e);
            if (vel) {
              this.setState({ currentUser: userName, players: players });
            }
          }
        });
      this.setState({ room: this.state.room, players: newPlayers });
    });*/
  }

  loadData() {
    socket.on("initGameState", ({ gameOver, players }) => {
      this.setState({ gameOver: gameOver, players: players });
    });

    socket.on("updateGameState", ({ gameOver, winner, players }) => {
      gameOver &&
        winner &&
        players &&
        this.setState({ gameOver: gameOver, winner: winner, players: players });
    });

    socket.on("roomData", ({ users }) => {
      this.setState({ users: users });
    });

    socket.on("currentUserData", ({ name }) => {
      this.setState({ currentUser: name });
    });
  }

  componentDidMount() {
    this.initSocket();
    this.loadData();

    window.addEventListener("keydown", this.handleKeyDown);

    this.timers.start = setTimeout(() => {
      this.setState({ walkingTime: Date.now() });
      this.walkingInMap();
    }, 3000);
  }

  isBigTab([posX, posY]) {
    return (posX === 0 || posX === 25) && (posY === 7 || posY === 26);
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

  changeDirection(direction) {
    console.log("new direction..");
    console.log("antes..");
    console.log(this.state.player);

    this.setState(changeDirection(this.state, { direction }));
    console.log("despues..");
    console.log(this.state.player);
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

    /*const players = this.state.players.map(({ id, ...player }) => (
      <Pacman
        key={id}
        {...props}
        {...player}
        lost={this.state.lost}
        onEnd={onEnd}
      />
    ));*/

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
                  {this.state.currentUser === "Player 1" && (
                    <>
                      <Pacman
                        {...props}
                        {...this.state.player}
                        lost={this.state.lost}
                        onEnd={onEnd}
                      />
                      <div className="lacman-score p1">
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
