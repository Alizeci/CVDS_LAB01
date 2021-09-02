import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { componentPosition } from '../constantsGame';
import './style.scss';

function Tab({gridSize, position, eaten, big }) {
    const className = classNames('tab', { eaten, big });
    const style = componentPosition(position, gridSize);

    return (
        <span className={className} style={style} />
    );
}

Tab.propTypes = {
    gridSize: PropTypes.number.isRequired,
    position: PropTypes.array.isRequired,
    eaten: PropTypes.bool.isRequired,
    big: PropTypes.bool.isRequired
};

export default function Tabs({ tabs, ...props }) {
    const items = tabs.filter(({ eaten }) => !eaten)
        .map(({ key, ...item }) => (
            <Tab key={key} {...item} {...props} />
        ));

    return (   
        <div className="tabs">
            {items}
        </div>
    );
}

Tabs.propTypes = {
    tabs: PropTypes.array.isRequired
};