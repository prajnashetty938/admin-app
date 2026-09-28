import React, { useMemo, useState } from "react";
import { FaEdit, FaImage, FaPlus, FaSort, FaTrash } from "react-icons/fa";
import "./BrandsPage.css";

const FILES_URL = "http://localhost:5000/uploads/brand";

const getBrandSlug = (brand) =>
  (brand.description || brand.slug || brand.name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const BrandsPage = ({ brands = [], onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState("10");

  const filteredBrands = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const matchingBrands = query
      ? brands.filter((brand) => {
          const slug = getBrandSlug(brand);
          return [brand.name, slug, brand.status].some((value) =>
            value?.toLowerCase().includes(query)
          );
        })
      : brands;

    return matchingBrands.slice(0, Number(pageSize));
  }, [brands, pageSize, searchTerm]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="brand-page container-fluid">
      <div className="brand-page-heading">
        <div>
          <h1>Brands</h1>
          <p>Manage product brands and manufacturers</p>
        </div>
        <button type="button" className="btn btn-primary brand-add-button" onClick={onAdd}>
          <FaPlus aria-hidden="true" />
          Add Brand
        </button>
      </div>

      <div className="brand-toolbar row align-items-center g-3">
        <div className="col-12 col-md-auto d-flex align-items-center gap-2">
          <span>Show</span>
          <select
            className="form-select brand-page-size"
            aria-label="Number of brands per page"
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
          <label className="brand-search-label" htmlFor="brand-search">Search:</label>
          <input
            id="brand-search"
            className="form-control brand-search-input"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {filteredBrands.length === 0 ? (
        <div className="brand-empty-state">No brands found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table brand-table align-middle mb-0">
            <thead>
              <tr>
                {[
                  ["Image", "brand-image-column"],
                  ["Name", ""],
                  ["Slug", ""],
                  ["Status", ""],
                  ["Created", ""],
                  ["Actions", "brand-actions-column"],
                ].map(([heading, className]) => (
                  <th key={heading} className={className} scope="col">
                    <span>{heading}</span>
                    <FaSort aria-hidden="true" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBrands.map((brand) => {
                const slug = getBrandSlug(brand);

                return (
                  <tr key={brand._id || brand.id}>
                    <td>
                      {brand.logo ? (
                        <img
                          className="brand-table-logo"
                          src={brand.logo.startsWith("data:image/") ? brand.logo : `${FILES_URL}/${encodeURIComponent(brand.logo)}`}
                          alt={`${brand.name} logo`}
                        />
                      ) : (
                        <span className="brand-image-placeholder"><FaImage aria-hidden="true" /></span>
                      )}
                    </td>
                    <td className="brand-name-cell">{brand.name}</td>
                    <td className="brand-slug-cell">{slug}</td>
                    <td>
                      <span
                        className={`brand-status-pill ${brand.status?.toLowerCase() === "inactive" ? "secondary" : "success"}`}
                      >
                        {brand.status}
                      </span>
                    </td>
                    <td>{formatDate(brand.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button type="button" className="btn brand-action-button edit" aria-label={`Edit ${brand.name}`} onClick={() => onEdit(brand)}>
                          <FaEdit aria-hidden="true" />
                        </button>
                        <button type="button" className="btn brand-action-button delete" aria-label={`Delete ${brand.name}`} onClick={() => onDelete(brand._id)}>
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
      )}
    </div>
  );
};

export default BrandsPage;
