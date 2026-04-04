import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import TopBar from "../TopBar/TopBar";
import { sidebarNav } from "../../data/dashboardData";
import "../../styles/AppShell.css";

function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar navData={sidebarNav} />
      <div className="app-shell-main">
        <TopBar title="FieldPortal" subtitle="Permian Basin Operations" />
        <div className="app-shell-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppShell;
