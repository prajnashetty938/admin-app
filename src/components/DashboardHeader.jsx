import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import "./Dashboard.css";

const DashboardHeader = ({ activePage }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSettings = () => {
    setMenuOpen(false);
    navigate("/settings");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <div className="dashboard-header">
      <h2 className="dashboard-title">{activePage === "Settings" ? "Global Settings" : activePage}</h2>

      <div className="user-menu">
        <button
          type="button"
          className="user-profile"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
        >
          <div className="avatar">SU</div>
          <div className="user-info">
            <span className="user-name">Super Admin</span>
            <span className="user-role">System Admin</span>
          </div>
        </button>

        {menuOpen && (
          <div className="user-dropdown">
            <button type="button" className="dropdown-item" onClick={handleSettings}>
              <FaCog className="dropdown-icon" />
              <span>Settings</span>
            </button>
            <button type="button" className="dropdown-item logout-item" onClick={handleLogout}>
              <FaSignOutAlt className="dropdown-icon" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
