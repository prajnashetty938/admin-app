import React, { useEffect, useRef, useState } from "react";
import {
  FaFileExport,
  FaFileImport,
  FaFilter,
  FaPlus,
  FaRedo,
  FaSearch,
} from "react-icons/fa";
import "./ProductsPage.css";

const ProductsPage = ({ onAdd, brands = [], categories = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const categoryFilterRef = useRef(null);
  const brandFilterRef = useRef(null);
  const activeCategories = categories.filter((item) => item.status === "Active");
  const activeBrands = brands.filter((item) => item.status === "Active");

  useEffect(() => {
    const closeCategoryFilter = (event) => {
      if (!categoryFilterRef.current?.contains(event.target)) {
        setCategoryOpen(false);
      }
      if (!brandFilterRef.current?.contains(event.target)) {
        setBrandOpen(false);
      }
    };

    document.addEventListener("mousedown", closeCategoryFilter);
    return () => document.removeEventListener("mousedown", closeCategoryFilter);
  }, []);

  const resetFilters = () => {
    setSearchTerm("");
    setStatus("");
    setCategory("");
    setBrand("");
    setCategoryOpen(false);
    setBrandOpen(false);
  };

  return (
    <div className="products-page container-fluid">
      <div className="products-page-heading">
        <div>
          <h1>Products</h1>
          <p>View, search, filter, and manage catalog items</p>
        </div>
        <div className="products-heading-actions">
          <button type="button" className="btn btn-outline-secondary products-secondary-button">
            <FaFileImport aria-hidden="true" /> Import
          </button>
          <button type="button" className="btn btn-outline-secondary products-secondary-button">
            <FaFileExport aria-hidden="true" /> Export
          </button>
          <button type="button" className="btn btn-primary products-add-button" onClick={onAdd}>
            <FaPlus aria-hidden="true" /> Add Product
          </button>
        </div>
      </div>

      <div className="products-filter-panel">
        <div className="products-filter-field products-search-field">
          <label htmlFor="product-search">Search</label>
          <div className="products-search-control">
            <FaSearch aria-hidden="true" />
            <input id="product-search" type="search" placeholder="Search product name or SKU..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
          </div>
        </div>
        <div className="products-filter-field">
          <label htmlFor="product-status-filter">Status</label>
          <select id="product-status-filter" className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
        <div className="products-filter-field">
          <label htmlFor="product-category-filter">Category</label>
          <div className="products-category-select" ref={categoryFilterRef}>
            <button
              id="product-category-filter"
              type="button"
              className={`form-select products-category-select-button${categoryOpen ? " is-open" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={categoryOpen}
              onClick={() => setCategoryOpen((isOpen) => !isOpen)}
            >
              {activeCategories.find((item) => (item._id || item.id) === category)?.name || "All categories"}
            </button>
            {categoryOpen && (
              <ul className="products-category-options" role="listbox" aria-labelledby="product-category-filter">
                <li
                  className={`products-category-option${!category ? " is-selected" : ""}`}
                  role="option"
                  aria-selected={!category}
                  onClick={() => {
                    setCategory("");
                    setCategoryOpen(false);
                  }}
                >
                  All categories
                </li>
                {activeCategories.map((item) => {
                  const itemValue = item._id || item.id;

                  return (
                    <li
                      key={itemValue}
                      className={`products-category-option${category === itemValue ? " is-selected" : ""}`}
                      role="option"
                      aria-selected={category === itemValue}
                      onClick={() => {
                        setCategory(itemValue);
                        setCategoryOpen(false);
                      }}
                    >
                      {item.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        <div className="products-filter-field">
          <label htmlFor="product-brand-filter">Brand</label>
          <div className="products-brand-select" ref={brandFilterRef}>
            <button
              id="product-brand-filter"
              type="button"
              className={`form-select products-brand-select-button${brandOpen ? " is-open" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={brandOpen}
              onClick={() => {
                setBrandOpen((isOpen) => !isOpen);
                setCategoryOpen(false);
              }}
            >
              {activeBrands.find((item) => (item._id || item.id) === brand)?.name || "All brands"}
            </button>
            {brandOpen && (
              <ul className="products-brand-options" role="listbox" aria-labelledby="product-brand-filter">
                <li
                  className={`products-brand-option${!brand ? " is-selected" : ""}`}
                  role="option"
                  aria-selected={!brand}
                  onClick={() => {
                    setBrand("");
                    setBrandOpen(false);
                  }}
                >
                  All brands
                </li>
                {activeBrands.map((item) => {
                  const itemValue = item._id || item.id;

                  return (
                    <li
                      key={itemValue}
                      className={`products-brand-option${brand === itemValue ? " is-selected" : ""}`}
                      role="option"
                      aria-selected={brand === itemValue}
                      onClick={() => {
                        setBrand(itemValue);
                        setBrandOpen(false);
                      }}
                    >
                      {item.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        <button type="button" className="btn btn-primary products-filter-button">
          <FaFilter aria-hidden="true" /> Filter
        </button>
        <button type="button" className="btn btn-outline-secondary products-reset-button" title="Reset filters" onClick={resetFilters}>
          <FaRedo aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default ProductsPage;
