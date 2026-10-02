import { useEffect, useState } from "react";
import { FaArrowLeft, FaImage, FaMobileAlt, FaDesktop, FaLink } from "react-icons/fa";
import "./CreateBanner.css";

const BANNER_FILES_URL = "http://localhost:5000/uploads/banner";

const getBannerImageUrl = (image) => {
  if (!image) return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;

  return `${BANNER_FILES_URL}/${encodeURIComponent(image)}`;
};

const CreateBanner = ({ onBack, onSubmit, initialData = null, mode = "create", categories = [] }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [bannerUrl, setBannerUrl] = useState(initialData?.destinationUrl || "");
  const [ctaText, setCtaText] = useState(initialData?.ctaText || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [position, setPosition] = useState(initialData?.position || "hero");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [active, setActive] = useState(initialData?.active ?? true);
  const [desktopImage, setDesktopImage] = useState(null);
  const [mobileImage, setMobileImage] = useState(null);
  const [tabletImage, setTabletImage] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const [tabletPreview, setTabletPreview] = useState("");
  const [quickCategoryOpen, setQuickCategoryOpen] = useState(false);

  const quickCategoryOptions = categories.length > 0
    ? categories.map((item) => ({ value: item.slug || item.name, label: item.name }))
    : [
        { value: "t-shirts", label: "T shirts" },
        { value: "goggles", label: "Goggles" },
        { value: "story-books", label: "Story Books" },
        { value: "short-kurti", label: "Short Kurti" },
        { value: "mens-wears", label: "Men's wears" },
        { value: "jeans", label: "Jeans" },
        { value: "table", label: "Table" },
        { value: "tv", label: "TV" },
        { value: "tablets-and-phones", label: "Tablets and phones" },
      ];

  useEffect(() => {
    if (!initialData) return;

    setTitle(initialData.title || "");
    setSubtitle(initialData.subtitle || "");
    setBannerUrl(initialData.destinationUrl || "");
    setCtaText(initialData.ctaText || "");
    setCategory(initialData.category || "");
    setPosition(initialData.position || "hero");
    setSortOrder(initialData.sortOrder ?? 0);
    setActive(initialData.active ?? true);
    setDesktopImage(null);
    setMobileImage(null);
    setTabletImage(null);
    setDesktopPreview(getBannerImageUrl(initialData.images?.desktop));
    setMobilePreview(getBannerImageUrl(initialData.images?.mobile));
    setTabletPreview(getBannerImageUrl(initialData.images?.tablet));
  }, [initialData]);

  const handleImageSelect = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (type === "desktop") {
      setDesktopImage(file);
      setDesktopPreview(previewUrl);
    }
    if (type === "mobile") {
      setMobileImage(file);
      setMobilePreview(previewUrl);
    }
    if (type === "tablet") {
      setTabletImage(file);
      setTabletPreview(previewUrl);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      destinationUrl: bannerUrl.trim(),
      ctaText: ctaText.trim(),
      category: category.trim(),
      position,
      sortOrder,
      active,
      desktopImage,
      mobileImage,
      tabletImage,
      images: {
        desktop: initialData?.images?.desktop || "",
        mobile: initialData?.images?.mobile || "",
        tablet: initialData?.images?.tablet || "",
      },
    };

    if (onSubmit) await onSubmit(payload);
  };

  return (
    <div className="create-banner-page container-fluid">
      <header className="create-banner-header">
        <div>
          <h1>{mode === "edit" ? "Edit Banner" : "Create Banner"}</h1>
          <p>Upload promotional banners and destination URLs</p>
        </div>

        <button type="button" className="btn create-banner-back" onClick={onBack}>
          <span className="arrow-left">←</span>
          <span>Back</span>
        </button>
      </header>

      <form className="create-banner-form" onSubmit={handleSubmit}>
        <div className="field-block">
          <label htmlFor="banner-title" className="field-label">Title</label>
          <input
            id="banner-title"
            className="field-input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="field-block">
          <label htmlFor="banner-subtitle" className="field-label">Subtitle</label>
          <input
            id="banner-subtitle"
            className="field-input"
            type="text"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
          />
        </div>

        <div className="field-block">
          <label className="field-label image-label">Image</label>
          <div className="image-grid">
            <div className="image-card">
              <div className="image-preview-box">
                {desktopPreview ? (
                  <img src={desktopPreview} alt="Desktop preview" className="selected-image-preview" />
                ) : (
                  <FaDesktop className="image-icon" />
                )}
              </div>
              <label className="upload-button">Select Desktop</label>
              <input type="file" accept="image/*" onChange={(event) => handleImageSelect(event, "desktop")} />
            </div>

            <div className="image-card">
              <div className="image-preview-box">
                {mobilePreview ? (
                  <img src={mobilePreview} alt="Mobile preview" className="selected-image-preview" />
                ) : (
                  <FaMobileAlt className="image-icon" />
                )}
              </div>
              <label className="upload-button">Select Mobile</label>
              <input type="file" accept="image/*" onChange={(event) => handleImageSelect(event, "mobile")} />
            </div>

            <div className="image-card">
              <div className="image-preview-box">
                {tabletPreview ? (
                  <img src={tabletPreview} alt="Tablet preview" className="selected-image-preview" />
                ) : (
                  <FaImage className="image-icon" />
                )}
              </div>
              <label className="upload-button">Select Tablet</label>
              <input type="file" accept="image/*" onChange={(event) => handleImageSelect(event, "tablet")} />
            </div>
          </div>
        </div>

        <div className="field-block">
          <label htmlFor="banner-url" className="field-label">
            <FaLink className="inline-icon" />
            <span>Banner Destination URL (link)</span>
          </label>
          <input
            id="banner-url"
            className="field-input"
            type="text"
            value={bannerUrl}
            placeholder="Example: /products/action-figures"
            onChange={(event) => setBannerUrl(event.target.value)}
          />
        </div>

        <div className="quick-link-box">
          <div className="quick-link-note">
            Quick URL Generator: Generate a link automatically by selecting a category or typing a Product Slug.
          </div>

          <div className="quick-link-row">
            <div className="quick-link-select-wrap category-select-wrap">
              <button
                type="button"
                className={`category-select-button ${quickCategoryOpen ? "is-open" : ""}`}
                onClick={() => setQuickCategoryOpen((current) => !current)}
              >
                <span>{quickCategoryOptions.find((item) => item.value === category)?.label || "-- Choose Category --"}</span>
                <span className="category-select-caret">▾</span>
              </button>

              {quickCategoryOpen && (
                <div className="category-select-menu" role="listbox" aria-label="Choose Category">
                  {quickCategoryOptions.map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      className={`category-select-option ${category === item.value ? "is-selected" : ""}`}
                      onClick={() => {
                        setCategory(item.value);
                        setQuickCategoryOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" className="quick-link-btn primary">
              Set Category Link
            </button>

            <span className="quick-or">OR</span>

            <div className="quick-link-input-wrap">
              <input
                className="field-input quick-link-input"
                type="text"
                placeholder="Product Slug or ID (e.g. mega-blocks)"
              />
            </div>

            <button type="button" className="quick-link-btn secondary">
              Set Product Link
            </button>
          </div>
        </div>

        <div className="field-block">
          <label htmlFor="banner-cta" className="field-label">CTA Text</label>
          <input
            id="banner-cta"
            className="field-input"
            type="text"
            value={ctaText}
            onChange={(event) => setCtaText(event.target.value)}
            placeholder="Shop now"
          />
        </div>

        <div className="two-column-row">
          <div className="field-block compact-field">
            <label htmlFor="banner-category" className="field-label">Category (where banner should show)</label>
            <select id="banner-category" className="field-input" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">-- Global --</option>
              {categories.length > 0 ? (
                categories.map((item) => (
                  <option key={item._id || item.id} value={item.slug || item.name}>
                    {item.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No categories available</option>
              )}
            </select>
          </div>

          <div className="field-block compact-field">
            <label htmlFor="banner-position" className="field-label">Position</label>
            <select id="banner-position" className="field-input" value={position} onChange={(event) => setPosition(event.target.value)}>
              <option value="hero">Hero</option>
              <option value="promo">Mid</option>
              <option value="featured">Sidebar</option>
            </select>
          </div>

          <div className="field-block compact-field">
            <label htmlFor="banner-order" className="field-label">Sort Order</label>
            <input id="banner-order" className="field-input" type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value) || 0)} />
          </div>
        </div>

        <div className="checkbox-row">
          <label className="checkbox-label">
            <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
            <span>Active</span>
          </label>
        </div>

        <div className="save-actions">
          <button type="submit" className="btn btn-primary save-button">{mode === "edit" ? "Update" : "Save"}</button>
          <button type="button" className="btn cancel-button" onClick={onBack}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateBanner;
