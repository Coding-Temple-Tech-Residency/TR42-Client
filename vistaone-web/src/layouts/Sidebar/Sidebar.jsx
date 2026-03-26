// sidebar component - the left nav panel with links and user info
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Sidebar.css";

// importing icons from react-icons (fi = Feather Icons set)
import { FiGrid, FiList, FiClipboard, FiFileText, FiUsers, FiFolder, FiLogOut } from "react-icons/fi";

// navData gets passed in from the parent component (App.jsx)
function Sidebar({ navData }) {
  const navigate = useNavigate();

  // clears the token and sends user back to login
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="sidebar">

      {/* brand section at the top */}
      <div className="sidebar-brand">
        <h2 className="sidebar-title">FieldPortal</h2>
        <p className="sidebar-subtitle">Permian Basin Operations</p>
      </div>

      {/* navigation links */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">MAIN</p>

        {/* map through each main nav item and render it as a list item */}
        <ul className="sidebar-list">
          {navData.main.map((item) => (
            <li
              key={item.label}
              // if item is active, add the "active" class so it highlights
              className={`sidebar-item ${item.active ? "active" : ""}`}
            >
              <span className="sidebar-icon">{getIcon(item.icon)}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        <p className="sidebar-section-label">ACCOUNT</p>

        {/* same thing but for the account section */}
        <ul className="sidebar-list">
          {navData.account.map((item) => (
            <li
              key={item.label}
              className={`sidebar-item ${item.active ? "active" : ""}`}
            >
              <span className="sidebar-icon">{getIcon(item.icon)}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* user profile and logout at the bottom */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">RC</div>
          <div>
            <p className="sidebar-user-name">R. Chavez</p>
            <p className="sidebar-user-role">Company Rep</p>
          </div>
        </div>

        {/* logout button */}
        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

// maps each icon name to an actual react-icons component
function getIcon(iconName) {
  const icons = {
    grid: <FiGrid />,           // dashboard
    list: <FiList />,           // jobs
    clipboard: <FiClipboard />, // work orders
    file: <FiFileText />,       // invoices
    users: <FiUsers />,         // vendors
    folder: <FiFolder />,       // contracts
  };
  return icons[iconName] || null;
}

export default Sidebar;
