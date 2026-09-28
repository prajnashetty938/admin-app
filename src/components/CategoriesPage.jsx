import React, { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaExternalLinkAlt,
  FaImage,
  FaPlus,
  FaSort,
  FaTrash,
} from "react-icons/fa";
import "./CategoriesPage.css";

const initialCategories = [
  { id: 22, name: "Educational Toys", slug: "educational-toys", parent: "Toys", sortOrder: 1, status: "Active", createdAt: "2026-08-08" },
  { id: 21, name: "Childrens Books", slug: "childrens-books", parent: "Books", sortOrder: 2, status: "Active", createdAt: "2026-08-08" },
  { id: 20, name: "Fiction", slug: "fiction", parent: "Books", sortOrder: 1, status: "Active", createdAt: "2026-08-08" },
  { id: 19, name: "Mixed Dry Fruits", slug: "mixed-dry-fruits", parent: "Dry Fruits", sortOrder: 2, status: "Active", createdAt: "2026-08-08" },
];

const CategoriesPage = ({ categories: loadedCategories, onAdd, onEdit, onDelete }) => {
  const [categories, setCategories] = useState(loadedCategories || initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState("10");

  useEffect(() => {
    if (loadedCategories) {
      setCategories(loadedCategories);
    }
  }, [loadedCategories]);

  const visibleCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const matchingCategories = query
      ? categories.filter((category) =>
          [category.name, category.slug, category.parentCategory || category.parent, category.status].some((value) =>
            value?.toLowerCase().includes(query)
          )
        )
      : categories;

    return matchingCategories.slice(0, Number(pageSize));
  }, [categories, pageSize, searchTerm]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const removeCategory = async (category) => {
    const categoryId = category._id || category.id;
    if (!categoryId) return;

    if (onDelete) {
      await onDelete(categoryId);
      return;
    }

    setCategories((currentCategories) =>
      currentCategories.filter((currentCategory) => (currentCategory._id || currentCategory.id) !== categoryId)
    );
  };

  return (
    <div className="categories-page container-fluid">
      <div className="categories-page-heading">
        <div>
          <h1>Categories</h1>
          <p>Manage product categories and sub-categories</p>
        </div>
        <button type="button" className="btn btn-primary categories-add-button" onClick={onAdd}>
          <FaPlus aria-hidden="true" />
          Add Category
        </button>
      </div>

      <div className="categories-toolbar row align-items-center g-3">
        <div className="col-12 col-md-auto d-flex align-items-center gap-2">
          <span>Show</span>
          <select
            className="form-select categories-page-size"
            aria-label="Number of categories per page"
            value={pageSize}
            onChange={(event) => setPageSize(event.target.value)}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>entries</span>
        </div>
        <div className="col-12 col-md ms-md-auto">
          <label className="categories-search-label" htmlFor="category-search">Search:</label>
          <input
            id="category-search"
            className="form-control categories-search-input"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table categories-table align-middle mb-0">
          <thead>
            <tr>
              {[
                ["ID", ""],
                ["Image", ""],
                ["Name", ""],
                ["Slug", ""],
                ["Parent", ""],
                ["Sort Order", "categories-sort-column"],
                ["Status", ""],
                ["Created", ""],
                ["Actions", "categories-actions-column"],
              ].map(([heading, className]) => (
                <th key={heading} className={className} scope="col">
                  <span>{heading}</span>
                  <FaSort aria-hidden="true" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleCategories.map((category) => (
              <tr key={category.id}>
                <td>{category.id || category._id?.toString?.().slice(-6)}</td>
                <td>
                  {category.image ? (
                    <img className="category-table-image" src={`http://localhost:5000/uploads/category/${encodeURIComponent(category.image)}`} alt={`${category.name} category`} />
                  ) : (
                    <span className="category-image-placeholder"><FaImage aria-hidden="true" /></span>
                  )}
                </td>
                <td className="category-name-cell">{category.name}</td>
                <td className="category-slug-cell">{category.slug}</td>
                <td>{category.parentCategory || category.parent || "-"}</td>
                <td>{category.sortOrder}</td>
                <td>
                  <span
                    className={`category-status-pill ${category.status?.toLowerCase() === "inactive" ? "secondary" : "success"}`}
                  >
                    {category.status}
                  </span>
                </td>
                <td>{formatDate(category.createdAt)}</td>
                <td>
                  <div className="category-action-buttons">
                    <button type="button" className="btn category-action-button view" aria-label={`View ${category.name}`}>
                      <FaExternalLinkAlt aria-hidden="true" />
                    </button>
                    <button type="button" className="btn category-action-button edit" title="Edit" aria-label={`Edit ${category.name}`} onClick={() => onEdit(category)}>
                      <FaEdit aria-hidden="true" />
                    </button>
                    <button type="button" className="btn category-action-button delete" aria-label={`Delete ${category.name}`} onClick={() => removeCategory(category)}>
                      <FaTrash aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleCategories.length === 0 && <div className="categories-empty-state">No categories found.</div>}
    </div>
  );
};

export default CategoriesPage;
