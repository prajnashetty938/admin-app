import React from "react";
import "./CreateCollection.css";

const CreateCollection = ({ setActivePage }) => {
  return (
    <div className="create-collection-page">
        <h2 className="create-collection-title">Create Collection</h2>
      {/* Subtitle + Back button row */}
      <div className="collections-topbar">
        <p className="collections-desc">
          Set up featured collections and product groups.
        </p>
        <button 
          className="back-btn" 
          onClick={() => setActivePage("Collections")}
        >
          ← Back
        </button>
      </div>

      {/* Form */}
      <form className="collection-form">
        <label>
          Collection Name *
          <input type="text" placeholder="e.g., Featured Products, New Arrivals" />
        </label>

        <label>
          Branch / Brandline
          <input type="text" placeholder="e.g., Performance, Originals" />
        </label>

        <label>
          Description
          <textarea placeholder="Enter description"></textarea>
        </label>

        <label>
          Sort Order
          <input type="number" defaultValue="0" />
        </label>

        <label>
          Status *
          <select>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>

        <div className="image-upload">
          <p>Image</p>
          <div className="image-placeholder">🖼️</div>
          <button type="button" className="set-image-btn">Set Image</button>
        </div>

        <div className="form-actions">
          <button type="submit" className="create-btn">Create Collection</button>
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={() => setActivePage("Collections")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCollection;
