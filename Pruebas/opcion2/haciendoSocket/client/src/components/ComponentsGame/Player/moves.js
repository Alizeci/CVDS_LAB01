import { PLAYER_SPEED } from "../constantsGame";
import paths from "./paths";

// Asigna la orientación del movimiento del jugador
export function setPolarity(direction) {
  const coord1 = (direction < 2) >> 0;
  const coord2 = (-1) ** (1 - coord1);
  const coord3 = direction % 2;

  return { coord1, coord2, coord3 };
}

// Cambia la dirección del movimiento del jugador
export function changeDirection(state, { direction }) {
  console.log("Estas en changeDirection");
  const oldPolarity = setPolarity(state.player.direction);
  const newPolarity = setPolarity(direction);

  console.log("oldPolarity:" + oldPolarity);
  console.log("newPolarity:" + newPolarity);

  if (oldPolarity.coord3 === newPolarity.coord3) {
    return {
      ...state,
      player: {
        ...state.player,
        direction,
        nextDirection: direction,
      },
    };
  }

  return {
    ...state,
    player: {
      ...state.player,
      nextDirection: direction,
    },
  };
}

// Actualiza el estado del movimiento del jugador
export function walking(state, { time = Date.now() } = {}) {
  const timeSeconds = (time - state.walkingTime) / 1000;
  if (state.lost) {
    return state;
  }

  const playerWalking = updatePlayer(
    { ...state, walkingTime: time },
    timeSeconds
  );

  return playerWalking;
}

// Cambia el estado del juego; el vector de movimiento del jugador y el estado de las pastillas en el tablero
export function updatePlayer(state, time) {
  const newVector = getNewPlayerVector(state.player, time);
  const eatentabsIndex = getEatentabs(
    state.tabs,
    state.player,
    newVector.position
  );
  const tabs = state.tabs.slice();
  let scoreDelta = 0;
  if (eatentabsIndex > -1) {
    tabs[eatentabsIndex].eaten = true;

    scoreDelta = 1 + (tabs[eatentabsIndex].big >> 2);
  }

  const nextState = {
    ...state,
    score: state.score + scoreDelta,
    player: {
      ...state.player,
      ...newVector,
    },
    tabs,
  };

  return nextState;
}

// Retorna las pastillas que el jugador se ha comido
function getEatentabs(tabs, player, newPosition) {
  const { coord3, coord2 } = setPolarity(player.direction);

  return tabs.findIndex(
    ({ position, eaten }) =>
      !eaten &&
      position[1 - coord3] === player.position[1 - coord3] &&
      coord2 * position[coord3] >= coord2 * player.position[coord3] &&
      coord2 * position[coord3] <= coord2 * newPosition[coord3]
  );
}

function getNewPlayerVector(player, time) {
  const { newPosition, movedDistance } = getNewPosition(
    player.position,
    player.direction,
    PLAYER_SPEED,
    time
  );

  if (player.nextDirection !== player.direction) {
    const changedVector = getChangedVector(
      player.position,
      newPosition,
      player.direction,
      player.nextDirection,
      movedDistance
    );

    if (changedVector) {
      return { position: changedVector, direction: player.nextDirection };
    }
  }

  return { position: newPosition };
}

// Cambia la posición del jugador teniendo en cuenta los muros en el tablero
export function getNewPosition(
  position,
  direction,
  speed,
  time,
  toNearestCoord3 = true
) {
  const { coord1, coord3, coord2 } = setPolarity(direction);

  const newPosition = position.slice();
  const movedVector = coord2 * speed * time;
  let movedDistance = Math.abs(movedVector);

  const nearestOtherCoord3 = Math.round(newPosition[1 - coord3]);
  if (toNearestCoord3) {
    newPosition[1 - coord3] = nearestOtherCoord3;
  }

  newPosition[coord3] += movedVector;

  const path = paths[coord3][nearestOtherCoord3];

  const pathHit = path.findIndex(
    (limits) =>
      position[coord3] >= limits[0] &&
      position[coord3] <= limits[1] &&
      coord2 * newPosition[coord3] > coord2 * limits[coord1]
  );

  let collision = false;

  if (pathHit === (path.length - 1) * coord1 && path[pathHit][2]) {
    // wrap
    newPosition[coord3] = path[(path.length - 1) * (1 - coord1)][1 - coord1];

    movedDistance = speed * time;
  } else if (pathHit > -1) {
    newPosition[coord3] = path[pathHit][coord1];

    movedDistance = Math.abs(position[coord3] - path[pathHit][coord1]);

    collision = true;
  }
  return { newPosition, collision, movedDistance };
}

export function continueMoving(coord3, coord1, position, tolerance) {
  const snap = coord1
    ? Math.ceil(position[coord3])
    : Math.floor(position[coord3]);

  if (Math.abs(snap - position[coord3]) > tolerance) {
    return -1;
  }

  return snap;
}

export function getChangedVector(
  oldPosition,
  newPosition,
  oldDirection,
  newDirection,
  movedDistance
) {
  const { coord3: oldCoord3, coord1: oldCoord1 } = setPolarity(oldDirection);

  const pathTo = continueMoving(
    oldCoord3,
    oldCoord1,
    newPosition,
    movedDistance
  );
  if (pathTo === -1) {
    return null;
  }

  const old0 = oldPosition[oldCoord3];
  const new0 = newPosition[oldCoord3];

  const movedDistanceBeforeTurn = Math.abs(pathTo - newPosition[oldCoord3]);

  if (!(old0 === new0 && movedDistanceBeforeTurn > movedDistance)) {
    const { coord1: newCoord1, coord3: newCoord3, coord2 } = setPolarity(
      newDirection
    );

    const path = paths[newCoord3][pathTo];
    if (!path) {
      return null;
    }

    const pathHit = path.findIndex(
      (limits) =>
        newPosition[newCoord3] >= limits[0] &&
        newPosition[newCoord3] <= limits[1] &&
        (1 - newCoord1) * newPosition[newCoord3] >=
          (limits[0] - coord2) * (1 - newCoord1) &&
        newCoord1 * newPosition[newCoord3] <= (limits[1] - coord2) * newCoord1
    );

    if (pathHit > -1) {
      const changedVector = newPosition.slice();

      changedVector[oldCoord3] = pathTo;
      changedVector[newCoord3] +=
        coord2 * (movedDistance - movedDistanceBeforeTurn);

      return changedVector;
    }
  }

  return null;
}
