
import React from "react";
import "./ProductCollections.css";

const ProductCollections = ({ setActivePage }) => {
  return (
    <div className="collections-page">
      <div className="collections-topbar">
        <p className="collections-desc">
          Manage featured groups and product collections.
        </p>
        <button 
          className="add-btn" 
          onClick={() => setActivePage("Create Collection")}
        >
          + Add Collection
        </button>
      </div>

      <div className="collections-empty">
        <div className="empty-icon">📦</div>
        <p>No collections found.</p>
        <p className="hint">
          Create collections like <strong>Featured</strong>, <strong>New Arrivals</strong>, <strong>Best Sellers</strong>.
        </p>
      </div>
    </div>
  );
};

export default ProductCollections;
