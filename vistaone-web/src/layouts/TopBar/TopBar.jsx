import React from "react";
import { FiBell, FiSearch } from "react-icons/fi";
import "../../styles/TopBar.css";

function TopBar({ title, subtitle }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <FiSearch className="topbar-search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search..."
          />
        </div>
        <button className="topbar-icon-btn">
          <FiBell />
        </button>
      </div>
    </header>
  );
}

export default TopBar;
