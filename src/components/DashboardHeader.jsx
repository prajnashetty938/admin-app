import React from "react";
import "./Dashboard.css";

const DashboardHeader = ({ activePage }) => {
  return (
    <div className="dashboard-header">
      <h2 className="dashboard-title">{activePage}</h2>
      <div className="user-profile">
        <div className="avatar">SU</div>
        <div className="user-info">
          <span className="user-name">Super Admin</span>
          <span className="user-role">System Admin</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
