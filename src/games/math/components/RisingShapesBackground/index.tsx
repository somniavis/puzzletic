import React from 'react';
import './RisingShapesBackground.css';

export const RisingShapesBackground = React.memo(() => {
    return (
        <div className="rising-shapes-area">
            <ul className="rising-circles">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
    );
});
