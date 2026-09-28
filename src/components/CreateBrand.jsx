import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import "./CreateBrand.css";

const CreateBrand = ({ onSubmit, onBack, initialData = null, mode = "create" }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialData) {
      setName("");
      setDescription("");
      setStatus("Active");
      setLogo("");
      setLogoFile(null);
      setLogoFileName("");
      setLogoPreview("");
      return;
    }

    setName(initialData.name || "");
    setDescription(initialData.description || "");
    setStatus(initialData.status || "Active");
    setLogo(initialData.logo || "");
    setLogoFile(null);
    setLogoFileName("");
    setLogoPreview("");
  }, [initialData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Brand name is required");
      return;
    }

    const brandData = {
      name: name.trim(),
      description: description.trim(),
      status,
      logo,
      logoFile,
    };

    try {
      setSaving(true);
      await onSubmit(brandData);
    } catch (submitError) {
      console.error(submitError);
      setError(submitError.message || (mode === "edit" ? "Failed to update brand" : "Failed to create brand"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-brand-page container-fluid">
      <header className="brand-page-header">
        <div>
          <h1>{mode === "edit" ? "Edit Brand" : "Add Brand"}</h1>
          <p>Set up product brand details and logo</p>
        </div>
        <button type="button" className="btn btn-outline-secondary brand-back-button" onClick={onBack}>
          <FaArrowLeft aria-hidden="true" />
          Back
        </button>
      </header>

      <form onSubmit={handleSubmit} className="brand-form row g-4">
        <div className="col-12 col-xl-8">
          <section className="brand-card h-100">
            <div className="brand-card-heading">Brand Information</div>
            <div className="brand-card-body">
              <div className="mb-3">
                <label htmlFor="brand-name" className="form-label">Name <span>*</span></label>
                <input
                  id="brand-name"
                  className="form-control"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="brand-description" className="form-label">Description</label>
                <textarea
                  id="brand-description"
                  className="form-control brand-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-4 brand-side-column">
          <section className="brand-card">
            <div className="brand-card-heading">Status &amp; Visibility</div>
            <div className="brand-card-body">
              <label htmlFor="brand-status" className="form-label">Status</label>
              <select
                id="brand-status"
                className="form-select"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </section>

          <section className="brand-card">
            <div className="brand-card-heading">Logo</div>
            <div className="brand-card-body">
              <label htmlFor="brand-logo" className="form-label visually-hidden">Choose file</label>
              <input
                id="brand-logo"
                className="form-control"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0];
                  if (!selectedFile) return;

                  if (selectedFile.size > 2 * 1024 * 1024) {
                    setError("Logo must be smaller than 2 MB");
                    event.target.value = "";
                    return;
                  }

                  setLogoFile(selectedFile);
                  setLogoFileName(selectedFile.name);
                  setLogoPreview(URL.createObjectURL(selectedFile));
                  setError("");
                }}
              />
              <small className="form-text">
                {logoFileName || "Recommended size: 200x200px (maximum 2 MB)"}
              </small>
              {logoPreview && (
                <img className="brand-logo-preview" src={logoPreview} alt="Selected brand logo preview" />
              )}
            </div>
          </section>

          <section className="brand-card brand-actions-card">
            <div className="brand-card-body">
              {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
              <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                <FaSave aria-hidden="true" />
                {saving ? "Saving..." : mode === "edit" ? "Update Brand" : "Create Brand"}
              </button>
              <button type="button" className="btn btn-outline-secondary w-100" onClick={onBack} disabled={saving}>
                Cancel
              </button>
            </div>
          </section>
        </div>

      </form>
    </div>
  );
};

export default CreateBrand;