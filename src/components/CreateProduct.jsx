import React, { useEffect, useRef, useState } from "react";
import {
  FaBold,
  FaChevronDown,
  FaImage,
  FaItalic,
  FaLink,
  FaListOl,
  FaListUl,
  FaPlus,
  FaSave,
  FaTrash,
  FaUnderline,
} from "react-icons/fa";
import "./CreateProduct.css";

const CreateProduct = ({ onDiscard, onQuickAddBrand, brands = [], categories = [] }) => {
  const [productType, setProductType] = useState("Simple product");
  const [status, setStatus] = useState("Active");
  const [productName, setProductName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [media, setMedia] = useState([]);
  const [chargeTax, setChargeTax] = useState(true);
  const [taxClass, setTaxClass] = useState("Default Tax Class");
  const [selectedAgeGroups, setSelectedAgeGroups] = useState([]);
  const [searchListingOpen, setSearchListingOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [quickAddBrandOpen, setQuickAddBrandOpen] = useState(false);
  const [quickBrandName, setQuickBrandName] = useState("");
  const [quickBrandSaving, setQuickBrandSaving] = useState(false);
  const [quickBrandError, setQuickBrandError] = useState("");
  const [availableBrands, setAvailableBrands] = useState(brands);
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [trackQuantity, setTrackQuantity] = useState(true);
  const [quantity, setQuantity] = useState("0");
  const [isPhysicalProduct, setIsPhysicalProduct] = useState(true);
  const [weight, setWeight] = useState("0");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [contentType, setContentType] = useState("Non Document");
  const [totalItems, setTotalItems] = useState("1");
  const [dimensions, setDimensions] = useState({ length: "0", width: "0", height: "0" });
  const [dimensionUnit, setDimensionUnit] = useState("cm");
  const [declaredValue, setDeclaredValue] = useState("0");
  const tagsRef = useRef(null);

  const ageGroups = [
    "Chapter Books (6-8 Years)",
    "Early Readers (3-5 Years)",
    "Middle Grade (9-12 Years)",
    "Picture Books (0-2 Years)",
  ];
  const tagOptions = ["0-6 Months", "6-12 Months", "12-36 Months", "36+ Months"];

  useEffect(() => {
    setAvailableBrands(brands);
  }, [brands]);

  useEffect(() => {
    const closeTags = (event) => {
      if (!tagsRef.current?.contains(event.target)) {
        setTagsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeTags);
    return () => document.removeEventListener("mousedown", closeTags);
  }, []);

  const toggleTag = (tag) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag]
    );
    setTagInput("");
  };

  const saveQuickBrand = async (event) => {
    event.preventDefault();
    if (!quickBrandName.trim() || !onQuickAddBrand) return;

    try {
      setQuickBrandSaving(true);
      setQuickBrandError("");
      const savedBrand = await onQuickAddBrand({
        name: quickBrandName.trim(),
        description: "",
        status: "Active",
      });
      setAvailableBrands((currentBrands) => [
        savedBrand,
        ...currentBrands.filter((brand) => (brand._id || brand.id) !== (savedBrand._id || savedBrand.id)),
      ]);
      setSelectedBrand(savedBrand?._id || savedBrand?.id || "");
      setQuickBrandName("");
      setQuickAddBrandOpen(false);
    } catch (error) {
      setQuickBrandError(error.message || "Failed to save brand");
    } finally {
      setQuickBrandSaving(false);
    }
  };
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const parentNames = [...new Set(categories.flatMap((category) => {
    const parentName = category.parentCategory || category.parent;
    return parentName ? [parentName] : [category.name];
  }))];
  const categoryGroups = parentNames.map((parentName) => {
    const parentRecord = categories.find(
      (category) => category.name === parentName && !(category.parentCategory || category.parent)
    );

    return {
      id: parentRecord?._id || parentRecord?.id || `parent-${parentName}`,
      name: parentName,
      children: categories.filter((category) =>
        (category.parentCategory || category.parent) === parentName
      ),
    };
  });

  const toggleCategory = (categoryId) => {
    setSelectedCategoryIds((selectedIds) =>
      selectedIds.includes(categoryId)
        ? selectedIds.filter((selectedId) => selectedId !== categoryId)
        : [...selectedIds, categoryId]
    );
  };

  const toggleCategoryGroup = (group) => {
    const groupIds = [String(group.id), ...group.children.map((category) =>
      String(category._id || category.id)
    )];
    const allSelected = groupIds.every((categoryId) => selectedCategoryIds.includes(categoryId));

    setSelectedCategoryIds((selectedIds) =>
      allSelected
        ? selectedIds.filter((selectedId) => !groupIds.includes(selectedId))
        : [...new Set([...selectedIds, ...groupIds])]
    );
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files?.[0];
    if (!selectedImage) return;
    setImagePreview(URL.createObjectURL(selectedImage));
  };

  const handleMediaChange = (event) => {
    setMedia(Array.from(event.target.files || []));
  };

  const addFaq = () => {
    setFaqs((currentFaqs) => [
      ...currentFaqs,
      { question: "", answer: "", active: true },
    ]);
  };

  const updateFaq = (faqIndex, field, value) => {
    setFaqs((currentFaqs) =>
      currentFaqs.map((faq, index) =>
        index === faqIndex ? { ...faq, [field]: value } : faq
      )
    );
  };

  return (
    <div className="create-product-page container-fluid">
      <header className="product-page-header">
        <div>
          <h1>Add New Product</h1>
          <p>Fill in product details, pricing, inventory and options</p>
        </div>
        <div className="product-header-actions">
          <button type="button" className="btn btn-outline-secondary product-discard-button" onClick={onDiscard}>
            Discard
          </button>
          <button type="submit" form="product-form" className="btn btn-primary product-save-button">
            <FaSave aria-hidden="true" />
            Save Product
          </button>
        </div>
      </header>

      <form id="product-form" className="product-body" onSubmit={(event) => event.preventDefault()}>
        <div className="product-main-column">
          <section className="product-card product-type-card">
            <label htmlFor="product-type" className="product-card-label">Product Type</label>
            <select id="product-type" className="form-select" value={productType} onChange={(event) => setProductType(event.target.value)}>
              <option>Simple product</option>
              <option>Variable product</option>
              <option>Grouped product</option>
            </select>
          </section>

          <section className="product-card product-information-card">
            <h2>Product Information</h2>
            <label htmlFor="product-name" className="product-card-label">Product Name <span>*</span></label>
            <input id="product-name" className="form-control" type="text" value={productName} onChange={(event) => setProductName(event.target.value)} required />

            <label htmlFor="product-description" className="product-card-label product-description-label">Description</label>
            <div className="product-editor">
              <div className="product-editor-toolbar" aria-label="Description formatting tools">
                <button type="button" title="Bold"><FaBold aria-hidden="true" /></button>
                <button type="button" title="Italic"><FaItalic aria-hidden="true" /></button>
                <button type="button" title="Underline"><FaUnderline aria-hidden="true" /></button>
                <button type="button" title="Bulleted list"><FaListUl aria-hidden="true" /></button>
                <button type="button" title="Numbered list"><FaListOl aria-hidden="true" /></button>
                <button type="button" title="Insert link"><FaLink aria-hidden="true" /></button>
              </div>
              <select className="form-select product-editor-format" aria-label="Text format" defaultValue="Paragraph">
                <option>Paragraph</option>
                <option>Heading 2</option>
                <option>Heading 3</option>
              </select>
              <div id="product-description" className="product-editor-content" contentEditable suppressContentEditableWarning data-placeholder="Write a detailed product description..." />
            </div>
          </section>

          <section className="product-card product-faq-card">
            <div className="product-section-heading">
              <div>
                <h2>Product FAQs</h2>
                <p>Shown only on this product page.</p>
              </div>
              <button type="button" className="btn btn-outline-primary product-add-faq-button" onClick={addFaq}>
                <FaPlus aria-hidden="true" />
                Add FAQ
              </button>
            </div>
            {faqs.length === 0 ? (
              <p className="product-empty-message">No product FAQs yet. Add common customer questions here.</p>
            ) : (
              faqs.map((faq, index) => (
                <div className="product-faq-row" key={`faq-${index}`}>
                  <div className="product-faq-row-heading">
                    <h3>FAQ</h3>
                    <button
                      type="button"
                      className="btn product-faq-delete-button"
                      aria-label={`Delete FAQ ${index + 1}`}
                      onClick={() => setFaqs((currentFaqs) => currentFaqs.filter((_, faqIndex) => faqIndex !== index))}
                    >
                      <FaTrash aria-hidden="true" />
                    </button>
                  </div>
                  <label htmlFor={`faq-question-${index}`}>Question</label>
                  <input
                    id={`faq-question-${index}`}
                    className="form-control"
                    placeholder="e.g. Is this product safe for children?"
                    value={faq.question}
                    onChange={(event) => updateFaq(index, "question", event.target.value)}
                  />
                  <label htmlFor={`faq-answer-${index}`}>Answer</label>
                  <textarea
                    id={`faq-answer-${index}`}
                    className="form-control"
                    placeholder="Write the answer..."
                    value={faq.answer}
                    onChange={(event) => updateFaq(index, "answer", event.target.value)}
                  />
                  <label className="product-faq-active-toggle">
                    <input
                      type="checkbox"
                      checked={faq.active}
                      onChange={(event) => updateFaq(index, "active", event.target.checked)}
                    />
                    <span className="product-faq-toggle-track" aria-hidden="true"><span /></span>
                    Active
                  </label>
                </div>
              ))
            )}
          </section>

          <section className="product-card product-media-card">
            <h2>Media</h2>
            <label htmlFor="product-media" className="btn btn-outline-primary product-media-upload">
              <FaImage aria-hidden="true" />
              <span>{media.length ? `${media.length} file${media.length === 1 ? "" : "s"} selected` : "Add Media"}</span>
            </label>
            <input id="product-media" className="visually-hidden" type="file" accept="image/*" multiple onChange={handleMediaChange} />
            <p className="product-media-helper">Images will be saved when you save the product.</p>
          </section>

          <section className="product-card product-pricing-card">
            <h2>Pricing</h2>
            <div className="product-pricing-fields">
              <div>
                <label htmlFor="product-price" className="form-label">Price <span>*</span></label>
                <div className="product-currency-input"><span>₹</span><input id="product-price" className="form-control" type="number" min="0" step="0.01" placeholder="0.00" /></div>
              </div>
              <div>
                <label htmlFor="compare-price" className="form-label">Compare at price</label>
                <div className="product-currency-input"><span>₹</span><input id="compare-price" className="form-control" type="number" min="0" step="0.01" placeholder="0.00" /></div>
              </div>
              <div>
                <label htmlFor="cost-per-item" className="form-label">Cost per item</label>
                <div className="product-currency-input"><span>₹</span><input id="cost-per-item" className="form-control" type="number" min="0" step="0.01" placeholder="0.00" /></div>
                <small>Customers won't see this</small>
              </div>
              <label className="product-tax-check">
                <input type="checkbox" checked={chargeTax} onChange={(event) => setChargeTax(event.target.checked)} />
                Charge tax on this product
              </label>
              <div className="product-tax-class-field">
                <label htmlFor="product-tax-class" className="form-label">Tax Class</label>
                <select id="product-tax-class" className="form-select" value={taxClass} onChange={(event) => setTaxClass(event.target.value)}>
                  <option>Default Tax Class</option>
                  <option>Reduced Tax Class</option>
                  <option>Zero Tax Class</option>
                </select>
              </div>
            </div>
          </section>

          <section className="product-card product-inventory-card">
            <h2>Inventory</h2>
            <div className="product-inventory-fields">
              <div>
                <label htmlFor="product-sku" className="form-label">SKU (Stock Keeping Unit)<span>*</span></label>
                <input id="product-sku" className="form-control" type="text" value={sku} onChange={(event) => setSku(event.target.value)} />
              </div>
              <div>
                <label htmlFor="product-barcode" className="form-label">Barcode (ISBN, UPC, GTIN, etc.)</label>
                <input id="product-barcode" className="form-control" type="text" value={barcode} onChange={(event) => setBarcode(event.target.value)} />
              </div>
              <label className="product-track-quantity">
                <input type="checkbox" checked={trackQuantity} onChange={(event) => setTrackQuantity(event.target.checked)} />
                Track quantity
              </label>
              {trackQuantity && (
                <div className="product-quantity-field">
                  <label htmlFor="product-quantity" className="form-label">Quantity</label>
                  <input id="product-quantity" className="form-control" type="number" min="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
                </div>
              )}
            </div>
          </section>

          <section className="product-card product-shipping-card">
            <h2>Shipping</h2>
            <div className="product-shipping-fields">
              <label className="product-physical-toggle">
                <input type="checkbox" checked={isPhysicalProduct} onChange={(event) => setIsPhysicalProduct(event.target.checked)} />
                This is a physical product
              </label>

              <div className="product-weight-field">
                <label htmlFor="product-weight" className="form-label">Weight</label>
                <div className="product-combined-input">
                  <input id="product-weight" className="form-control" type="number" min="0" value={weight} onChange={(event) => setWeight(event.target.value)} />
                  <select value={weightUnit} onChange={(event) => setWeightUnit(event.target.value)} aria-label="Weight unit">
                    <option>kg</option>
                    <option>g</option>
                    <option>lb</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="product-content-type" className="form-label">Content Type</label>
                <select id="product-content-type" className="form-select" value={contentType} onChange={(event) => setContentType(event.target.value)}>
                  <option>Non Document</option>
                  <option>Document</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="product-total-items" className="form-label">Total Items (in numbers)<span>*</span></label>
                <input id="product-total-items" className="form-control" type="number" min="1" value={totalItems} onChange={(event) => setTotalItems(event.target.value)} />
              </div>

              <div className="product-dimensions-field">
                <label className="form-label">Dimensions<span>*</span></label>
                <div className="product-dimensions-inputs">
                  {[["L", "length"], ["W", "width"], ["H", "height"]].map(([label, field]) => (
                    <div className="product-measurement-input" key={field}>
                      <span>{label}</span>
                      <input
                        className="form-control"
                        type="number"
                        min="0"
                        value={dimensions[field]}
                        onChange={(event) => setDimensions((currentDimensions) => ({ ...currentDimensions, [field]: event.target.value }))}
                        aria-label={`${label} dimension`}
                      />
                    </div>
                  ))}
                  <select value={dimensionUnit} onChange={(event) => setDimensionUnit(event.target.value)} aria-label="Dimension unit">
                    <option>cm</option>
                    <option>mm</option>
                    <option>in</option>
                  </select>
                </div>
              </div>

              <div className="product-declared-value-field">
                <label htmlFor="product-declared-value" className="form-label">Declared Value</label>
                <div className="product-currency-input">
                  <span>₹</span>
                  <input id="product-declared-value" className="form-control" type="number" min="0" value={declaredValue} onChange={(event) => setDeclaredValue(event.target.value)} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="product-side-column">
          <section className="product-card product-status-card">
            <h2>Status <span>*</span></h2>
            <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <p>Set the product status. 'Active' makes it visible on the store.</p>
          </section>

          <section className="product-card product-featured-image-card">
            <h2>Featured Image</h2>
            <label htmlFor="featured-image" className="product-featured-image-box">
              {imagePreview ? <img src={imagePreview} alt="Featured product preview" /> : <><FaImage aria-hidden="true" /><span>Click to set featured image</span></>}
            </label>
            <input id="featured-image" className="visually-hidden" type="file" accept="image/*" onChange={handleImageChange} />
            <label htmlFor="featured-image" className="btn btn-outline-primary product-featured-image-button">
              Set Featured Image
            </label>
          </section>

          <section className="product-card product-featured-toggle-card">
            <label className="product-featured-toggle">
              <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />
              <span className="product-toggle-track" aria-hidden="true"><span /></span>
              <strong>Is Featured Product?</strong>
            </label>
            <p>Check this to promote this product on the homepage or featured lists.</p>
          </section>

          <section className="product-card product-organization-card">
            <h2>Organization</h2>
            <div className="product-organization-fields">
              <label htmlFor="product-brand">Brand</label>
              <div className="product-organization-control">
                <select id="product-brand" className="form-select" value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)}>
                  <option value="">-- Select Brand --</option>
                  {availableBrands.map((brand) => <option key={brand._id || brand.id} value={brand._id || brand.id}>{brand.name}</option>)}
                </select>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setQuickAddBrandOpen(true)}><FaPlus aria-hidden="true" /> Quick Add</button>
              </div>

              <label htmlFor="product-author">Author</label>
              <select id="product-author" className="form-select" defaultValue="">
                <option value="">-- Select Author --</option>
              </select>

              <label>Categories</label>
              <div className="product-category-checklist">
                {categoryGroups.map((group) => {
                  const groupIds = [String(group.id), ...group.children.map((category) =>
                    String(category._id || category.id)
                  )];

                  return (
                    <div className="product-category-group" key={group.id}>
                      <label className="product-category-parent">
                        <input
                          type="checkbox"
                          checked={groupIds.every((categoryId) => selectedCategoryIds.includes(categoryId))}
                          onChange={() => toggleCategoryGroup(group)}
                        />
                        {group.name}
                      </label>
                      {group.children.map((childCategory) => {
                        const childId = String(childCategory._id || childCategory.id);

                        return (
                          <label className="product-category-child" key={childCategory._id || childCategory.id}>
                            <input
                              type="checkbox"
                              checked={selectedCategoryIds.includes(childId)}
                              onChange={() => toggleCategory(childId)}
                            />
                            {childCategory.name}
                          </label>
                        );
                      })}
                    </div>
                  );
                })}
                {categoryGroups.length === 0 && <span className="product-category-empty">No active categories available.</span>}
              </div>

              <label htmlFor="product-collections">Collections</label>
              <input id="product-collections" className="form-control" placeholder="Select options" />

              <label htmlFor="product-tags">Tags</label>
              <div className="product-tags-select" ref={tagsRef}>
                <div className="product-selected-tags">
                  {selectedTags.map((tag) => (
                    <button
                      type="button"
                      className="product-tag-chip"
                      key={tag}
                      aria-label={`Remove ${tag}`}
                      onClick={() => toggleTag(tag)}
                    >
                      <span aria-hidden="true">&times;</span>
                      {tag}
                    </button>
                  ))}
                  <input
                    id="product-tags"
                    value={tagInput}
                    onFocus={() => setTagsOpen(true)}
                    onChange={(event) => {
                      setTagInput(event.target.value);
                      setTagsOpen(true);
                    }}
                    className="product-tags-input"
                    placeholder={selectedTags.length === 0 ? "Select or type to add tags" : ""}
                  />
                </div>
                {tagsOpen && (
                  <div className="product-tags-menu">
                    <div className="product-tags-menu-heading">Shop By Age</div>
                    {tagOptions
                      .filter((tag) => tag.toLowerCase().includes(tagInput.toLowerCase()))
                      .map((tag) => (
                        <button
                          type="button"
                          className={`product-tags-option${selectedTags.includes(tag) ? " is-selected" : ""}`}
                          key={tag}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    <div className="product-tags-menu-heading">Existing Tags</div>
                  </div>
                )}
              </div>
              <p className="product-tags-helper">Select or type to add new tags</p>

              <label>Age Groups</label>
              <div className="product-age-group-list">
                {ageGroups.map((ageGroup) => (
                  <label key={ageGroup}>
                    <input
                      type="checkbox"
                      checked={selectedAgeGroups.includes(ageGroup)}
                      onChange={() => setSelectedAgeGroups((selectedGroups) =>
                        selectedGroups.includes(ageGroup)
                          ? selectedGroups.filter((selectedGroup) => selectedGroup !== ageGroup)
                          : [...selectedGroups, ageGroup]
                      )}
                    />
                    {ageGroup}
                  </label>
                ))}
              </div>
              <p className="product-age-group-helper">Tag this product with age groups for "Shop by Age" filtering.</p>
            </div>
          </section>

          <section className="product-card product-search-listing-card">
            <button
              type="button"
              className="product-search-listing-heading"
              aria-expanded={searchListingOpen}
              onClick={() => setSearchListingOpen((isOpen) => !isOpen)}
            >
              <span>Search Engine Listing</span>
              <FaChevronDown aria-hidden="true" />
            </button>
            {searchListingOpen && (
              <div className="product-search-listing-fields">
                <label htmlFor="seo-title">SEO Title</label>
                <input id="seo-title" className="form-control" placeholder="Search result title" />
                <label htmlFor="seo-description">SEO Description</label>
                <textarea id="seo-description" className="form-control" placeholder="Search result description" />
              </div>
            )}
          </section>

          {quickAddBrandOpen && (
            <div className="product-modal-backdrop" role="presentation">
              <div className="product-quick-add-modal" role="dialog" aria-modal="true" aria-labelledby="quick-add-brand-title">
                <div className="product-quick-add-header">
                  <h2 id="quick-add-brand-title">Quick Add Brand</h2>
                  <button type="button" className="product-modal-close" aria-label="Close" onClick={() => setQuickAddBrandOpen(false)}>×</button>
                </div>
                <div className="product-quick-add-body">
                  <label htmlFor="quick-brand-name">Brand Name <span>*</span></label>
                  <input id="quick-brand-name" className="form-control" value={quickBrandName} onChange={(event) => setQuickBrandName(event.target.value)} placeholder="e.g. Fisher-Price" autoFocus required />
                  {quickBrandError && <div className="alert alert-danger py-2">{quickBrandError}</div>}
                </div>
                <div className="product-quick-add-actions">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setQuickAddBrandOpen(false)} disabled={quickBrandSaving}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={saveQuickBrand} disabled={quickBrandSaving}>{quickBrandSaving ? "Saving..." : "Save Brand"}</button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </form>
    </div>
  );
};

export default CreateProduct;
