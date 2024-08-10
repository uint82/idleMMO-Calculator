// NavBar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaCalculator } from "react-icons/fa";
import './NavBar.css';

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-logo">
          <FaCalculator size="24px"/>
          <span>IdleMMO Skill Calculator</span>
        </h1>
      </div>
      <div className="navbar-right">
        <NavLink to="/woodcutting" className="navbar-link" activeclassname="active">Woodcutting</NavLink>
        <NavLink to="/mining" className="navbar-link" activeclassname="active">Mining</NavLink>
        <NavLink to="/fishing" className="navbar-link" activeclassname="active">Fishing</NavLink>
        <NavLink to="/alchemy" className="navbar-link" activeclassname="active">Alchemy</NavLink>
        <NavLink to="/smelting" className="navbar-link" activeclassname="active">Smelting</NavLink>
        <NavLink to="/cooking" className="navbar-link" activeclassname="active">Cooking</NavLink>
        <NavLink to="/forge" className="navbar-link" activeclassname="active">Forge</NavLink>
      </div>
    </nav>
  );
}

export default NavBar;