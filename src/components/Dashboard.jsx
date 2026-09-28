import React from "react";
import Sidebar from "./Sidebar";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div className="dashboard-header">
          <h2 className="dashboard-title">Dashboard</h2>
          <div className="user-profile">
            <div className="avatar">SU</div>
            <div className="user-info">
              <span className="user-name">Super Admin</span>
              <span className="user-role">System Admin</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="dashboard-content">
          <h3>Dashboard Overview</h3>
          {/* Add your content here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
