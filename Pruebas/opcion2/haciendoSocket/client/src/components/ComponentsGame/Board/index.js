import React from "react";
import PropTypes from "prop-types";
import { BOARD_WIDTH, BOARD_HEIGHT } from "../constantsGame";
import Walls from "./Walls";
import "./board.scss";

export default function Board(props) {
  const { gridSize } = props;

  const boardWidth = gridSize * BOARD_WIDTH;
  const boardHeight = gridSize * BOARD_HEIGHT;

  return (
    <div className="lacman-board">
      <svg width={boardWidth} height={boardHeight}>
        <rect x={0} y={0} width={boardWidth} height={boardHeight} fill="#000" />
        <Walls {...props} />
      </svg>
    </div>
  );
}

Board.propTypes = {
  gridSize: PropTypes.number.isRequired,
};
