import React from 'react';
import './PortalMathBackground.css';

export const PortalMathBackground: React.FC = () => (
    <div className="portal-math-background" aria-hidden="true">
        <div className="portal-math-background__aurora portal-math-background__aurora--left" />
        <div className="portal-math-background__aurora portal-math-background__aurora--right" />
        <div className="portal-math-background__math-layer">
            <div className="portal-math-background__math portal-math-background__math--a">+</div>
            <div className="portal-math-background__math portal-math-background__math--b">-</div>
            <div className="portal-math-background__math portal-math-background__math--c">x</div>
            <div className="portal-math-background__math portal-math-background__math--d">/</div>
            <div className="portal-math-background__math portal-math-background__math--e">+</div>
            <div className="portal-math-background__math portal-math-background__math--f">x</div>
            <div className="portal-math-background__math portal-math-background__math--g">/</div>
            <div className="portal-math-background__math portal-math-background__math--h">-</div>
            <div className="portal-math-background__math portal-math-background__math--i">+</div>
            <div className="portal-math-background__math portal-math-background__math--j">x</div>
            <div className="portal-math-background__math portal-math-background__math--k">/</div>
            <div className="portal-math-background__math portal-math-background__math--l">-</div>
        </div>
    </div>
);

export default PortalMathBackground;
