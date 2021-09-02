export const BOARD_WIDTH = 28;
export const BOARD_HEIGHT = 36;
export const WALL_COLOUR = "#06f";

export const EAST = 0;
export const NORTH = 1;
export const WEST = 2;
export const SOUTH = 3;

export const PLAYER_RADIUS = 0.75;

export const PLAYER_SPEED = 5;

export function componentPosition(position, gridSize) {
  //console.log("position: x: " + position[0] + " y: " + position[1]);
  return {
    left: (position[0] + 23.5) * gridSize,
    top: (BOARD_HEIGHT - position[1] - 3) * gridSize,
  };
}
