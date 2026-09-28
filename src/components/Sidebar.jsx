import React from "react";
import "./Sidebar.css";
import logo from "../assets/logo.png";
import {
  FaTachometerAlt, FaShoppingCart, FaBoxOpen, FaLayerGroup,
  FaTags, FaIndustry, FaUserTie, FaTag, FaUsers, FaDollarSign,
  FaImage, FaHome, FaCogs, FaNewspaper, FaFileAlt, FaQuestionCircle,
  FaPhotoVideo, FaUserFriends, FaChartBar, FaMoneyBillWave,
  FaCog, FaTruck, FaMapMarkerAlt, FaUserShield
} from "react-icons/fa";

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt /> },
    { label: "Orders", icon: <FaShoppingCart />, badge: "NEW" },
    { label: "Products", icon: <FaBoxOpen /> },
    { label: "Collections", icon: <FaLayerGroup /> },
    { label: "Categories", icon: <FaTags /> },
    { label: "Brands", icon: <FaIndustry /> },
    { label: "Authors", icon: <FaUserTie /> },
    { label: "Tags", icon: <FaTag /> },
    { label: "Age Groups", icon: <FaUsers /> },
    { label: "Product Prices", icon: <FaDollarSign /> },
  ];

  const marketingItems = [
    { label: "Banners", icon: <FaImage /> },
    { label: "Homepage Editor", icon: <FaHome /> },
    { label: "Site Menu Builder", icon: <FaCogs /> },
    { label: "Newsletters", icon: <FaNewspaper /> },
    { label: "Pages", icon: <FaFileAlt /> },
    { label: "FAQs", icon: <FaQuestionCircle /> },
    { label: "Media Manager", icon: <FaPhotoVideo /> },
  ];

  const customerItems = [
    { label: "Customers", icon: <FaUserFriends /> },
    { label: "Analytics", icon: <FaChartBar /> },
    { label: "Payment Logs", icon: <FaMoneyBillWave /> },
  ];

  const configItems = [
    { label: "Settings", icon: <FaCog /> },
    { label: "Courier Partners", icon: <FaTruck /> },
    { label: "Product Settings", icon: <FaCogs /> },
    { label: "Locations", icon: <FaMapMarkerAlt /> },
    { label: "Admin Users", icon: <FaUserShield /> },
  ];

  const renderList = (items) => (
    <ul className="list-unstyled mb-0">
      {items.map((item) => (
        <li
          key={item.label}
          className={`sidebar-item d-flex align-items-center${activePage === item.label ? " active" : ""}`}
          onClick={() => setActivePage(item.label)}
        >
          <span className="sidebar-icon d-flex align-items-center justify-content-center">{item.icon}</span>
          <span className="sidebar-label">{item.label}</span>
          {item.badge && <span className="new-label badge rounded-pill">{item.badge}</span>}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="sidebar">
      <div className="logo d-flex align-items-center justify-content-center">
        <img src={logo} alt="HungerCat Logo" className="logo-img" />
      </div>
      <hr className="sidebar-divider" />
      <div className="menu">
        {renderList(menuItems)}
        <h4 className="section-title">MARKETING & CONTENT</h4>
        {renderList(marketingItems)}
        <h4 className="section-title">CUSTOMERS & ANALYSIS</h4>
        {renderList(customerItems)}
        <h4 className="section-title">CONFIGURATION</h4>
        {renderList(configItems)}
      </div>
    </div>
  );
};

export default Sidebar;
