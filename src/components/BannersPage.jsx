import { useMemo, useState } from "react";
import { FaPlus, FaSort } from "react-icons/fa";
import "./BannersPage.css";

const BANNER_FILES_URL = "http://localhost:5000/uploads/banner";

const sampleBanners = [
  {
    _id: "1",
    title: "banner",
    position: "hero",
    category: "-",
    active: true,
    image: "",
  },
];

const BannersPage = ({ banners = sampleBanners, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const resolveBannerImage = (banner) => {
    const imageName = banner?.image || banner?.images?.desktop || banner?.images?.mobile || banner?.images?.tablet || "";

    if (!imageName) return "";
    if (imageName.startsWith("http://") || imageName.startsWith("https://") || imageName.startsWith("data:image/")) {
      return imageName;
    }

    return `${BANNER_FILES_URL}/${encodeURIComponent(imageName)}`;
  };

  const filteredBanners = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return banners;

    return banners.filter((banner) => {
      const haystack = [banner.title, banner.position, banner.category, banner.active ? "yes" : "no"]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [banners, searchTerm]);

  return (
    <div className="banners-page container-fluid">
      <div className="banners-page-heading">
        <div>
          <h1>Banners</h1>
          <p>Manage homepage and promotional banners</p>
        </div>
        <button type="button" className="btn banners-add-button" onClick={onAdd || (() => {})}>
          <FaPlus aria-hidden="true" />
          Add Banner
        </button>
      </div>

      <div className="banners-toolbar row align-items-center g-3">
        <div className="col-12 col-md-auto d-flex align-items-center gap-2 banners-show-block">
          <span>Show</span>
          <select
            className="form-select banners-page-size"
            aria-label="Number of banners per page"
            value={entriesPerPage}
            onChange={(event) => setEntriesPerPage(Number(event.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>

        <div className="col-12 col-md ms-md-auto banners-search-wrap">
          <label className="banners-search-label" htmlFor="banner-search">Search:</label>
          <input
            id="banner-search"
            className="form-control banners-search-input"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive banners-table-wrap">
        <table className="table banners-table align-middle mb-0">
          <thead>
            <tr>
              {[
                ["Image", "banners-image-column"],
                ["Title", ""],
                ["Position", ""],
                ["Category", ""],
                ["Active", ""],
                ["Actions", "banners-actions-column"],
              ].map(([heading, className]) => (
                <th key={heading} className={className} scope="col">
                  <span>{heading}</span>
                  <FaSort aria-hidden="true" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredBanners.length === 0 ? (
              <tr>
                <td colSpan="6" className="banners-empty-state">No banners found.</td>
              </tr>
            ) : (
              filteredBanners.slice(0, entriesPerPage).map((banner) => (
                <tr key={banner._id}>
                  <td className="banners-image-cell">
                    {resolveBannerImage(banner) ? (
                      <img src={resolveBannerImage(banner)} alt={banner.title} className="banners-thumb" />
                    ) : (
                      <div className="banners-thumb placeholder">
                        <span>banner</span>
                      </div>
                    )}
                  </td>
                  <td className="banners-title-cell">{banner.title}</td>
                  <td>{banner.position || "-"}</td>
                  <td>{banner.category || "-"}</td>
                  <td>{banner.active ? "Yes" : "No"}</td>
                  <td>
                    <div className="banners-actions">
                      <button
                        type="button"
                        className="btn banners-action-button edit"
                        aria-label={`Edit ${banner.title}`}
                        onClick={() => onEdit?.(banner)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn banners-action-button delete"
                        aria-label={`Delete ${banner.title}`}
                        onClick={() => onDelete?.(banner._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="banners-pagination-row">
        <span>Showing 1 to 1 of 1 entries</span>
        <div className="banners-pagination">
          <button type="button" className="btn banners-page-btn prev" disabled>
            Previous
          </button>
          <button type="button" className="btn banners-page-btn active">1</button>
          <button type="button" className="btn banners-page-btn next">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannersPage;
