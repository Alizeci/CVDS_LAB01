import React, { useState } from "react";
import { Link } from "react-router-dom";
import randomCodeGenerator from "../utils/randomCodeGenerator";

const Homepage = () => {
  // Declarando variable de estado!
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="container h-100">
      <div id="initialScreen" className="h-100">
        <div className="d-flex flex-column align-items-center justify-content-center h-100">
          <h1>Multiplayer Snake</h1>
          <Link to={`/game?roomCode=${randomCodeGenerator(5)}`}>
            <button
              type="submit"
              className="game-button green"
              id="newGameButton"
            >
              Create New Game
            </button>{" "}
          </Link>
          <div>OR</div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter Game Code"
              id="gameCodeInput"
              onChange={(event) => setRoomCode(event.target.value)}
            />
          </div>
          <Link to={`/game?roomCode=${roomCode}`}>
            <button
              type="submit"
              className="game-button orange"
              id="joinGameButton"
            >
              Join Game
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
