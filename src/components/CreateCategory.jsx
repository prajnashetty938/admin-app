import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaImage, FaSave } from "react-icons/fa";
import "./CreateCategory.css";

const CATEGORY_FILES_URL = "http://localhost:5000/uploads/category";
const parentCategoryOptions = [
  "Apparel",
  "Audio",
  "Books",
  "Cameras & Accessories",
  "Children's books",
  "Dry Fruits",
  "Electronics",
  "Fiction",
  "Gaming",
  "Men's clothing",
  "Laptops & Computers",
  "Mixed Dry Fruits",
  "Nuts",
  "Mobile Phones",
  "Tablets",
  "Women's clothing",
  "Toys",
  "TV & Home appliances",
  "Wearables",
];

const CreateCategory = ({ onBack, onSubmit, initialData = null, mode = "create" }) => {
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [status, setStatus] = useState("Active");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [parentCategoryOpen, setParentCategoryOpen] = useState(false);
  const [parentCategorySearch, setParentCategorySearch] = useState("");
  const parentCategoryRef = useRef(null);

  const filteredParentCategories = parentCategoryOptions.filter((option) =>
    option.toLowerCase().includes(parentCategorySearch.trim().toLowerCase())
  );

  useEffect(() => {
    const closeParentCategory = (event) => {
      if (!parentCategoryRef.current?.contains(event.target)) {
        setParentCategoryOpen(false);
        setParentCategorySearch("");
      }
    };

    document.addEventListener("mousedown", closeParentCategory);
    return () => document.removeEventListener("mousedown", closeParentCategory);
  }, []);

  useEffect(() => {
    if (!initialData) {
      setName("");
      setParentCategory("");
      setDescription("");
      setSortOrder("0");
      setStatus("Active");
      setMetaTitle("");
      setMetaDescription("");
      setImage(null);
      setImageName("");
      setImagePreview("");
      return;
    }

    setName(initialData.name || "");
    setParentCategory(initialData.parentCategory || "");
    setDescription(initialData.description || "");
    setSortOrder(String(initialData.sortOrder ?? 0));
    setStatus(initialData.status || "Active");
    setMetaTitle(initialData.metaTitle || "");
    setMetaDescription(initialData.metaDescription || "");
    setImage(null);
    setImageName(initialData.image || "");
    setImagePreview(initialData.image ? `${CATEGORY_FILES_URL}/${encodeURIComponent(initialData.image)}` : "");
  }, [initialData]);

  const handleImageChange = (event) => {
    const selectedImage = event.target.files?.[0];
    if (!selectedImage) return;

    setImage(selectedImage);
    setImageName("");
    setImagePreview(URL.createObjectURL(selectedImage));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setSaving(true);
      await onSubmit({
        name: name.trim(),
        parentCategory,
        description: description.trim(),
        sortOrder,
        status,
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        image,
        imageName,
      });
    } catch (submitError) {
      console.error(submitError);
      setError(submitError.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-category-page container-fluid">
      <header className="category-page-header">
        <div>
          <h1>{mode === "edit" ? "Edit Category" : "Create Category"}</h1>
          <p>Organize and manage catalog categories</p>
        </div>
        <button type="button" className="btn btn-outline-secondary category-back-button" onClick={onBack}>
          <FaArrowLeft aria-hidden="true" />
          Back
        </button>
      </header>

      <form className="category-form" onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <label htmlFor="category-name" className="form-label">Name <span>*</span></label>
            <input id="category-name" className="form-control" type="text" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>

          <div className="col-12 col-lg-6">
            <label htmlFor="parent-category" className="form-label">Parent Category</label>
            <div className="category-select" ref={parentCategoryRef}>
              <button
                id="parent-category"
                type="button"
                className={`form-select category-select-button${parentCategoryOpen ? " is-open" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={parentCategoryOpen}
                onClick={() => setParentCategoryOpen((isOpen) => !isOpen)}
              >
                {parentCategory || "-- Select Parent Category --"}
              </button>
              {parentCategoryOpen && (
                <div className="category-select-menu">
                  <input
                    className="category-select-search"
                    type="search"
                    value={parentCategorySearch}
                    onChange={(event) => setParentCategorySearch(event.target.value)}
                    placeholder="Search"
                    aria-label="Search parent categories"
                    autoFocus
                  />
                  <ul className="category-select-options" role="listbox" aria-labelledby="parent-category">
                    <li
                      className={`category-select-option category-select-placeholder${!parentCategory ? " is-selected" : ""}`}
                      role="option"
                      aria-selected={!parentCategory}
                      onClick={() => {
                        setParentCategory("");
                        setParentCategoryOpen(false);
                        setParentCategorySearch("");
                      }}
                    >
                      -- Select Parent Category --
                    </li>
                    {filteredParentCategories.length > 0 ? filteredParentCategories.map((option) => (
                      <li
                        key={option}
                        className={`category-select-option${parentCategory === option ? " is-selected" : ""}`}
                        role="option"
                        aria-selected={parentCategory === option}
                        onClick={() => {
                          setParentCategory(option);
                          setParentCategoryOpen(false);
                          setParentCategorySearch("");
                        }}
                      >
                        {option}
                      </li>
                    )) : (
                      <li className="category-select-no-results">No categories found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="col-12">
            <label htmlFor="category-description" className="form-label">Description</label>
            <textarea id="category-description" className="form-control category-description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="sort-order" className="form-label">Sort Order</label>
            <input id="sort-order" className="form-control" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} min="0" />
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="category-status" className="form-label">Status <span>*</span></label>
            <select id="category-status" className="form-select" value={status} onChange={(event) => setStatus(event.target.value)} required>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="category-image" className="form-label">Image</label>
            <div className="category-image-box">
              {imagePreview ? (
                <img src={imagePreview} alt="Category preview" />
              ) : (
                <FaImage aria-hidden="true" />
              )}
            </div>
            <input id="category-image" className="visually-hidden" type="file" accept="image/*" onChange={handleImageChange} />
            <label htmlFor="category-image" className="btn btn-outline-primary category-image-button">
              Set Image
            </label>
            {image && <small className="category-image-name">{image.name}</small>}
          </div>
        </div>

        <section className="category-seo-section">
          <h2>SEO Information</h2>
          <div className="row g-4">
            <div className="col-12">
              <label htmlFor="meta-title" className="form-label">Meta Title</label>
              <input id="meta-title" className="form-control" type="text" value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} />
            </div>
            <div className="col-12">
              <label htmlFor="meta-description" className="form-label">Meta Description</label>
              <textarea id="meta-description" className="form-control" value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} />
            </div>
          </div>
        </section>

        <div className="category-form-actions">
          {error && <div className="alert alert-danger category-form-error" role="alert">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <FaSave aria-hidden="true" />
            {saving ? "Saving..." : mode === "edit" ? "Update Category" : "Create Category"}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={onBack} disabled={saving}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
