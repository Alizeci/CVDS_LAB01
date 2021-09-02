import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_RADIUS, componentPosition } from '../../constantsGame';
import './style.scss';

const ANIMATION_SPEED = 30;

function pacmanPath(radius, angle, offset) {

    const offsetX = radius * Math.cos(angle / 2);
    const offsetY = radius * Math.sin(angle / 2);

    const polarity = (-1) ** Math.floor(offset / 2);

    const m00 = ((offset + 1) % 2) * polarity;
    const m01 = (offset % 2) * polarity;

    const biteX1 = offsetX * m00 - offsetY * m01;
    const biteY1 = -offsetX * m01 - offsetY * m00;
    const biteX2 = offsetX * m00 + offsetY * m01;
    const biteY2 = -offsetX * m01 + offsetY * m00;

    const arcFlag = (angle < Math.PI) >> 0;

    let setCoordinates = [`M${radius},${radius}`,`L${radius + biteX1},${radius + biteY1}`,
        `A${radius},${radius}`,`0 ${arcFlag} 0`,`${radius + biteX2},${radius + biteY2}`,
        `L${radius},${radius}`].join(' ');
        
    return setCoordinates;
}

export default class Pacman extends Component {
    constructor(props) {
        super(props);

        this.state = {
            angle: 1,
            timerBite: null,
            timerLose: null
        };

        this.startTime = Date.now();
    }

    componentDidMount() {
        this.setState({
            timerBite: setInterval(() => this.setState({
                angle: 1 + 0.5 * Math.sin((Date.now() - this.startTime) / 70)
            }), ANIMATION_SPEED)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.timerBite);
    }
    
    componentDidUpdate(prevProps) {
        if (!prevProps.lost && this.props.lost) {
            clearInterval(this.state.timerBite);
            this.setState({ angle: 0 });
        }
    }

    render() {
        const { gridSize, lost, position, direction } = this.props;

        const pathProps = {
            stroke: 'none',
            fill: 'yellow'
        };

        const radius = gridSize * PLAYER_RADIUS;

        const style = {
            ...componentPosition(position, gridSize),
            width: radius * 2,
            height: radius * 2,
            marginLeft: -radius,
            marginTop: -radius
        };

        const offset = lost ? 1 : direction;

        return (
            <svg className="pacman-player" style={style}>
                <path d={pacmanPath(radius, this.state.angle, offset)} {...pathProps} />
            </svg>
        );
    }
}

Pacman.propTypes = {
    animate: PropTypes.bool,
    gridSize: PropTypes.number.isRequired,
    lost: PropTypes.bool.isRequired,
    position: PropTypes.array.isRequired,
    direction: PropTypes.number.isRequired,
    onEnd: PropTypes.func
};