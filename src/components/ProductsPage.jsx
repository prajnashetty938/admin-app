import { useEffect, useRef, useState } from "react";
import {
  FaFileExport,
  FaFileImport,
  FaImage,
  FaEdit,
  FaExternalLinkAlt,
  FaBan,
  FaCheck,
  FaFilter,
  FaPlus,
  FaRedo,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import "./ProductsPage.css";

const API_ORIGIN = "http://localhost:5000";
const API_URL = `${API_ORIGIN}/api`;

const ProductsPage = ({ onAdd, onEdit, onDelete, onBulkStatusChange, brands = [], categories = [] }) => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const categoryFilterRef = useRef(null);
  const brandFilterRef = useRef(null);
  const activeCategories = categories.filter((item) => item.status === "Active");
  const activeBrands = brands.filter((item) => item.status === "Active");

  useEffect(() => {
    let isCurrent = true;

    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Failed to load products");
        }

        if (isCurrent) setProducts(data);
      } catch (error) {
        if (isCurrent) setProductsError(error.message || "Failed to load products");
      } finally {
        if (isCurrent) setProductsLoading(false);
      }
    };

    loadProducts();
    return () => {
      isCurrent = false;
    };
  }, []);

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
    setSelectedProductIds([]);
    setCurrentPage(1);
  };

  const updateFilter = (setter, value) => {
    setter(value);
    setSelectedProductIds([]);
    setCurrentPage(1);
  };

  const visibleProducts = products.filter((product) => {
    const matchesSearch = `${product.name || ""} ${product.sku || ""}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
    const matchesStatus = !status || product.status === status;
    const productCategoryIds = (product.categoryIds || []).map(String);
    const matchesCategory = !category || productCategoryIds.includes(String(category));
    const matchesBrand = !brand || String(product.brandId || "") === String(brand);

    return matchesSearch && matchesStatus && matchesCategory && matchesBrand;
  });

  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / entriesPerPage));
  const displayPage = Math.min(currentPage, pageCount);
  const firstVisibleEntry = visibleProducts.length ? (displayPage - 1) * entriesPerPage + 1 : 0;
  const lastVisibleEntry = Math.min(displayPage * entriesPerPage, visibleProducts.length);
  const pageProducts = visibleProducts.slice(firstVisibleEntry - 1, lastVisibleEntry);
  const pageProductIds = pageProducts.map((product) => String(product._id));
  const allPageProductsSelected = pageProductIds.length > 0 && pageProductIds.every((id) => selectedProductIds.includes(id));

  const toggleProductSelection = (productId) => {
    setSelectedProductIds((selectedIds) => selectedIds.includes(productId)
      ? selectedIds.filter((id) => id !== productId)
      : [...selectedIds, productId]);
  };

  const togglePageSelection = () => {
    setSelectedProductIds((selectedIds) => allPageProductsSelected
      ? selectedIds.filter((id) => !pageProductIds.includes(id))
      : [...new Set([...selectedIds, ...pageProductIds])]);
  };

  const changeSelectedStatus = async (nextStatus) => {
    if (selectedProductIds.length === 0) return;

    try {
      setIsUpdatingStatus(true);
      setProductsError("");
      await onBulkStatusChange(selectedProductIds, nextStatus);
      const selectedIds = new Set(selectedProductIds);
      setProducts((currentProducts) => currentProducts.map((product) =>
        selectedIds.has(String(product._id)) ? { ...product, status: nextStatus } : product
      ));
      setSelectedProductIds([]);
    } catch (error) {
      setProductsError(error.message || "Failed to update product statuses");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatProductDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;

    try {
      await onDelete(product._id);
      setProducts((currentProducts) => currentProducts.filter((item) => item._id !== product._id));
    } catch (error) {
      setProductsError(error.message || "Failed to delete product");
    }
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
            <input id="product-search" type="search" placeholder="Search product name or SKU..." value={searchTerm} onChange={(event) => updateFilter(setSearchTerm, event.target.value)} />
          </div>
        </div>
        <div className="products-filter-field">
          <label htmlFor="product-status-filter">Status</label>
          <select id="product-status-filter" className="form-select" value={status} onChange={(event) => updateFilter(setStatus, event.target.value)}>
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
                    updateFilter(setCategory, "");
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
                        updateFilter(setCategory, itemValue);
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
                    updateFilter(setBrand, "");
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
                        updateFilter(setBrand, itemValue);
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

      <div className="products-table-tools">
        <div className="products-bulk-actions">
          <button type="button" className="btn btn-success" disabled={!selectedProductIds.length || isUpdatingStatus} onClick={() => changeSelectedStatus("Active")}>
            <FaCheck aria-hidden="true" /> Make Active
          </button>
          <button type="button" className="btn btn-outline-danger" disabled={!selectedProductIds.length || isUpdatingStatus} onClick={() => changeSelectedStatus("Inactive")}>
            <FaBan aria-hidden="true" /> Make Inactive
          </button>
          {selectedProductIds.length > 0 && <span>{selectedProductIds.length} selected</span>}
        </div>
        <label className="products-entries-control" htmlFor="products-entries">
          Show
          <select id="products-entries" value={entriesPerPage} onChange={(event) => {
            setEntriesPerPage(Number(event.target.value));
            setCurrentPage(1);
          }}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          entries
        </label>
      </div>

      <div className="products-table-wrap">
        <table className="products-table">
          <thead>
            <tr>
              <th scope="col"><input type="checkbox" aria-label="Select products on this page" checked={allPageProductsSelected} onChange={togglePageSelection} disabled={!pageProductIds.length || productsLoading} /></th>
              <th scope="col">ID</th>
              <th scope="col">Product</th>
              <th scope="col">Brand</th>
              <th scope="col">Price</th>
              <th scope="col">Stock</th>
              <th scope="col">Status</th>
              <th scope="col">Date</th>
              <th scope="col" className="products-actions-heading">Action</th>
            </tr>
          </thead>
          <tbody>
            {productsLoading ? (
              <tr><td className="products-table-message" colSpan="9">Loading products...</td></tr>
            ) : productsError ? (
              <tr><td className="products-table-message is-error" colSpan="9">{productsError}</td></tr>
            ) : visibleProducts.length === 0 ? (
              <tr><td className="products-table-message" colSpan="9">{products.length ? "No products match these filters." : "No products yet."}</td></tr>
            ) : pageProducts.map((product) => {
              const productBrand = brands.find((item) => String(item._id || item.id) === String(product.brandId));
              const quantity = Number(product.quantity) || 0;

              return (
                <tr key={product._id || product.id}>
                  <td><input type="checkbox" aria-label={`Select ${product.name}`} checked={selectedProductIds.includes(String(product._id))} onChange={() => toggleProductSelection(String(product._id))} /></td>
                  <td>{product.id || String(product._id || "").slice(-6)}</td>
                  <td>
                    <div className="products-product-cell">
                      <div className="products-product-image">
                        {product.featuredImage ? (
                          <img src={`${API_ORIGIN}/uploads/product/${encodeURIComponent(product.featuredImage)}`} alt="" />
                        ) : <FaImage aria-hidden="true" />}
                      </div>
                      <div>
                        <strong>{product.name}</strong>
                        {product.sku && <span>{product.sku}</span>}
                      </div>
                    </div>
                  </td>
                  <td>{productBrand?.name || "—"}</td>
                  <td>{(Number(product.price) || 0).toFixed(2)}</td>
                  <td><span className={`products-stock-badge${quantity > 0 ? " is-in-stock" : " is-out-of-stock"}`}>{quantity > 0 ? `In Stock (${quantity})` : "Out of Stock"}</span></td>
                  <td><span className={`products-status-badge${product.status === "Active" ? " is-active" : " is-inactive"}`}>{product.status || "Draft"}</span></td>
                  <td>{formatProductDate(product.createdAt)}</td>
                  <td>
                    <div className="products-row-actions">
                      <button type="button" className="products-row-action" title="View product unavailable" aria-label={`View ${product.name} (unavailable)`} disabled>
                        <FaExternalLinkAlt aria-hidden="true" />
                      </button>
                      <button type="button" className="products-row-action" title="Edit product" aria-label={`Edit ${product.name}`} onClick={() => onEdit(product)}>
                        <FaEdit aria-hidden="true" />
                      </button>
                      <button type="button" className="products-row-action is-delete" title="Delete product" aria-label={`Delete ${product.name}`} onClick={() => deleteProduct(product)}>
                        <FaTrash aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="products-table-footer">
        <span>Showing {firstVisibleEntry} to {lastVisibleEntry} of {visibleProducts.length} entries</span>
        <div className="products-pagination" aria-label="Product pages">
          <button type="button" disabled={displayPage <= 1} onClick={() => setCurrentPage(displayPage - 1)}>Previous</button>
          <span>Page {displayPage} of {pageCount}</span>
          <button type="button" disabled={displayPage >= pageCount} onClick={() => setCurrentPage(displayPage + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
