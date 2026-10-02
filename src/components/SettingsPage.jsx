import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen, FaCheck, FaCreditCard, FaEnvelope, FaFacebook, FaImage, FaInstagram, FaSave, FaTimes, FaTruck, FaTwitter, FaYoutube } from "react-icons/fa";
import companyLogoAsset from "../assets/logo.png";
import "./SettingsPage.css";

const SETTINGS_KEY = "adminGlobalSettings";
const API_URL = "http://localhost:5000/api/settings/global";
const BRAND_BURGUNDY = "#800020";

const defaultSettings = {
  companyName: "Hoonja",
  address: "1st floor, Murali Krishna Mansion, near Krishi Vigyan Kendra, Bramavara, Chanthar, Karnataka 576213",
  phone: "+91 8105301860",
  email: "prajnashetty938@gmail.com",
  taxId: "29HDVPP3955G1Z8",
  defaultCountryCode: "+91",
  invoicePrefix: "INV-",
  nextInvoiceNumber: 12,
  defaultShippingCharge: 40,
  freeShippingThreshold: 499,
  primaryColor: "#000000",
  secondaryColor: "#000000",
  accentColor: "#000000",
  pageBackground: "#ffffff",
  headerBackground: "#ffffff",
  headerTextColor: "#000000",
  footerBackground: "#171725",
  footerTextColor: "#ffffff",
  categoriesButtonEnabled: true,
  categoriesButtonBackground: BRAND_BURGUNDY,
  categoriesButtonTextColor: "#ffffff",
  utilityBarBackground: "#111827",
  menuBarBackground: "#ffffff",
  menuTextColor: "#000000",
  promotionBarBackground: BRAND_BURGUNDY,
  promotionBarText: "#ffffff",
  companyLogo: companyLogoAsset,
  favicon: "",
  utilityTopBarEnabled: false,
  promotionBarEnabled: false,
  shopByAgeEnabled: true,
  whatsappEnquiryEnabled: true,
  whatsappNumber: "919876543210",
  footerTagline: "Hoonja | Premium E-Commerce Website Solutions & Demo",
  footerCopyright: "© {year} {company_name}. All Rights Reserved.",
  homeMetaTitle: "Hoonja | Premium E-Commerce Website Solutions & Demo",
  homeMetaDescription: "Experience the power of Hoonja E-Commerce. Explore our interactive demo panel to see how easily you can launch, manage, and grow your online store today.",
  homeMetaKeywords: "e-commerce platform, Hoonja, online store builder, e-commerce demo, start online shop",
  facebookUrl: "https://www.facebook.com/hungercatdigital",
  instagramUrl: "https://www.instagram.com/made_in_hungercat/",
  twitterUrl: "",
  youtubeUrl: "",
  announcementBar: true,
  storefrontEnabled: true,
};

const loadSettings = () => {
  try {
    const storedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const settings = { ...defaultSettings, ...storedSettings };

    if (storedSettings.categoriesButtonBackground === "#8f0027") {
      settings.categoriesButtonBackground = BRAND_BURGUNDY;
    }

    if (storedSettings.promotionBarBackground === "#8f0027") {
      settings.promotionBarBackground = BRAND_BURGUNDY;
    }

    if (!storedSettings.socialLinksInitialized) {
      if (!settings.facebookUrl) settings.facebookUrl = defaultSettings.facebookUrl;
      if (!settings.instagramUrl) settings.instagramUrl = defaultSettings.instagramUrl;
      settings.socialLinksInitialized = true;
    }

    return settings;
  } catch {
    return defaultSettings;
  }
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const notificationRef = useRef(null);
  const [settings, setSettings] = useState(loadSettings);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSettings = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
          },
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Failed to load global settings");
        }

        if (data.settings) {
          const mergedSettings = { ...loadSettings(), ...data.settings };
          setSettings(mergedSettings);
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(mergedSettings));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Load global settings error:", error);
        }
      }
    };

    fetchSettings();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (notification?.type === "success") {
      notificationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [notification]);

  const updateSetting = (event) => {
    const { name, value, checked, type } = event.target;
    setSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setNotification(null);
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
        body: JSON.stringify({ settings }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      const savedSettings = { ...settings, ...data.settings };
      setSettings(savedSettings);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(savedSettings));
      setNotification({ type: "success", title: "Perfect!", message: "Settings updated successfully." });
    } catch (error) {
      console.error("Save global settings error:", error);
      setNotification({ type: "error", title: "Unable to save settings.", message: error.message || "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const selectCompanyLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 3 * 1024 * 1024) {
      alert("Choose an image smaller than 3 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSettings((current) => ({ ...current, companyLogo: String(reader.result) }));
      setNotification(null);
    };
    reader.readAsDataURL(file);
  };

  const selectFavicon = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 1024 * 1024) {
      alert("Choose an image smaller than 1 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSettings((current) => ({ ...current, favicon: String(reader.result) }));
      setNotification(null);
    };
    reader.readAsDataURL(file);
  };

  const removeCompanyLogo = () => {
    setSettings((current) => ({ ...current, companyLogo: "" }));
    setNotification(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const removeFavicon = () => {
    setSettings((current) => ({ ...current, favicon: "" }));
    setNotification(null);
    if (faviconInputRef.current) faviconInputRef.current.value = "";
  };

  return (
    <form className="settings-page" onSubmit={saveSettings}>
      {notification && (
        <div ref={notificationRef} className={`settings-notification ${notification.type}`} role={notification.type === "error" ? "alert" : "status"}>
          <span className="settings-notification-icon">
            <FaCheck aria-hidden="true" />
          </span>
          <p><strong>{notification.title}</strong> {notification.message}</p>
          <button type="button" aria-label="Dismiss notification" onClick={() => setNotification(null)}>
            <FaTimes aria-hidden="true" />
          </button>
        </div>
      )}
      <header className="settings-intro">
        <h1>Global Settings</h1>
        <p>Business identity, branding, navigation colors, and storefront options</p>
      </header>

      <div className="settings-grid">
        <div className="settings-column settings-left-column">
        <section className="settings-card business-settings">
          <h2>Business Identity &amp; Contact</h2>
          <div className="settings-card-content">
            <label className="settings-field">
              <span>Company Name</span>
              <input name="companyName" value={settings.companyName} onChange={updateSetting} />
            </label>
            <label className="settings-field">
              <span>Address</span>
              <textarea name="address" rows="3" value={settings.address} onChange={updateSetting} />
            </label>
            <div className="settings-field-row">
              <label className="settings-field">
                <span>Phone</span>
                <input name="phone" type="tel" value={settings.phone} onChange={updateSetting} />
              </label>
              <label className="settings-field">
                <span>Email</span>
                <input name="email" type="email" value={settings.email} onChange={updateSetting} />
              </label>
            </div>
            <label className="settings-field">
              <span>Tax ID / GST Number</span>
              <input name="taxId" value={settings.taxId} onChange={updateSetting} />
            </label>
            <label className="settings-field">
              <span>Default Country Code</span>
              <select name="defaultCountryCode" value={settings.defaultCountryCode} onChange={updateSetting}>
                <option value="+91">India (+91)</option>
                <option value="+1">United States (+1)</option>
                <option value="+44">United Kingdom (+44)</option>
                <option value="+61">Australia (+61)</option>
                <option value="+971">United Arab Emirates (+971)</option>
              </select>
            </label>
          </div>
        </section>

        <section className="settings-card brand-appearance-settings">
          <h2>Brand Appearance</h2>
          <div className="settings-card-content brand-appearance-content">
            <p className="brand-appearance-note">All website colour controls are grouped here.</p>
            <div className="brand-color-grid">
              <label className="brand-color-field">
                <span>Primary Color</span>
                <input name="primaryColor" type="color" value={settings.primaryColor} onChange={updateSetting} />
              </label>
              <label className="brand-color-field">
                <span>Secondary Color</span>
                <input name="secondaryColor" type="color" value={settings.secondaryColor} onChange={updateSetting} />
              </label>
              <label className="brand-color-field">
                <span>Accent Color</span>
                <input name="accentColor" type="color" value={settings.accentColor} onChange={updateSetting} />
              </label>
              <label className="brand-color-field">
                <span>Page Background</span>
                <input name="pageBackground" type="color" value={settings.pageBackground} onChange={updateSetting} />
              </label>
            </div>

            <h3 className="brand-color-section-title">Header &amp; footer colours</h3>
            <div className="brand-color-grid">
              <label className="brand-color-field">
                <span>Header Background</span>
                <input name="headerBackground" type="color" value={settings.headerBackground} onChange={updateSetting} />
              </label>
              <label className="brand-color-field">
                <span>Header Text Color</span>
                <input name="headerTextColor" type="color" value={settings.headerTextColor} onChange={updateSetting} />
              </label>
              <label className="brand-color-field">
                <span>Footer Background</span>
                <input name="footerBackground" type="color" value={settings.footerBackground} onChange={updateSetting} />
              </label>
              <label className="brand-color-field">
                <span>Footer Text Color</span>
                <input name="footerTextColor" type="color" value={settings.footerTextColor} onChange={updateSetting} />
              </label>
            </div>

            <section className="categories-button-settings">
              <div className="categories-button-heading">
                <div>
                  <h3>Categories Button</h3>
                  <p>Show or hide the “Shop by category” dropdown in the storefront menu.</p>
                </div>
                <label className="settings-switch">
                  <input
                    name="categoriesButtonEnabled"
                    type="checkbox"
                    checked={settings.categoriesButtonEnabled}
                    onChange={updateSetting}
                  />
                  <span className="settings-switch-track" aria-hidden="true" />
                  <span>{settings.categoriesButtonEnabled ? "Enabled" : "Disabled"}</span>
                </label>
              </div>
              <div className="brand-color-grid">
                <label className="brand-color-field">
                  <span>Button Background</span>
                  <input name="categoriesButtonBackground" type="color" value={settings.categoriesButtonBackground} onChange={updateSetting} />
                </label>
                <label className="brand-color-field">
                  <span>Button Text Color</span>
                  <input name="categoriesButtonTextColor" type="color" value={settings.categoriesButtonTextColor} onChange={updateSetting} />
                </label>
              </div>
            </section>

            <section className="storefront-nav-settings">
              <div>
                <h3>Storefront navigation colours</h3>
                <p>These controls update the public header immediately after saving.</p>
              </div>
              <div className="brand-color-grid">
                <label className="brand-color-field">
                  <span>Utility Bar Background</span>
                  <input name="utilityBarBackground" type="color" value={settings.utilityBarBackground} onChange={updateSetting} />
                </label>
                <label className="brand-color-field">
                  <span>Menu Bar Background</span>
                  <input name="menuBarBackground" type="color" value={settings.menuBarBackground} onChange={updateSetting} />
                </label>
                <label className="brand-color-field">
                  <span>Menu Text Color</span>
                  <input name="menuTextColor" type="color" value={settings.menuTextColor} onChange={updateSetting} />
                </label>
                <label className="brand-color-field">
                  <span>Promotion Bar Background</span>
                  <input name="promotionBarBackground" type="color" value={settings.promotionBarBackground} onChange={updateSetting} />
                </label>
                <label className="brand-color-field">
                  <span>Promotion Bar Text</span>
                  <input name="promotionBarText" type="color" value={settings.promotionBarText} onChange={updateSetting} />
                </label>
              </div>
            </section>
          </div>
        </section>

        <section className="settings-card visibility-settings-card">
          <h2>Storefront Content &amp; Visibility</h2>
          <div className="settings-card-content visibility-settings-content">
            <div className="visibility-setting visibility-setting-separated">
              <p className="visibility-setting-title">Top Bar (Utility Bar)</p>
              <label className="visibility-toggle">
                <input name="utilityTopBarEnabled" type="checkbox" checked={settings.utilityTopBarEnabled} onChange={updateSetting} />
                <span className="settings-switch-track" aria-hidden="true" />
                <span>Show black utility top bar</span>
              </label>
              <small>The black utility line at the very top (contains links, shipping info, etc.).</small>
            </div>

            <div className="visibility-setting visibility-setting-separated">
              <p className="visibility-setting-title">Promotion Bar</p>
              <label className="visibility-toggle">
                <input name="promotionBarEnabled" type="checkbox" checked={settings.promotionBarEnabled} onChange={updateSetting} />
                <span className="settings-switch-track" aria-hidden="true" />
                <span>Show scrolling promotion bar</span>
              </label>
              <small>The scrolling shipping-offer strip below the header.</small>
            </div>

            <div className="visibility-setting">
              <p className="visibility-setting-title">Shop by Age Section</p>
              <label className="visibility-toggle">
                <input name="shopByAgeEnabled" type="checkbox" checked={settings.shopByAgeEnabled} onChange={updateSetting} />
                <span className="settings-switch-track" aria-hidden="true" />
                <span>Show &quot;Shop by Age&quot; section</span>
              </label>
              <small>The age-group tiles section on the homepage.</small>
            </div>

            <div className="visibility-setting">
              <p className="visibility-setting-title">WhatsApp Enquiry</p>
              <label className="visibility-toggle">
                <input name="whatsappEnquiryEnabled" type="checkbox" checked={settings.whatsappEnquiryEnabled} onChange={updateSetting} />
                <span className="settings-switch-track" aria-hidden="true" />
                <span>Show WhatsApp enquiry button on product pages</span>
              </label>
            </div>

            <label className="settings-field whatsapp-number-field">
              <span>WhatsApp Number</span>
              <input name="whatsappNumber" type="tel" value={settings.whatsappNumber} onChange={updateSetting} />
              <small>Enter country code and number without +, spaces, or dashes. Example: 919876543210.</small>
            </label>
            <label className="settings-field">
              <span>Footer Tagline</span>
              <input name="footerTagline" value={settings.footerTagline} onChange={updateSetting} />
              <small>Displayed below the logo in the website footer.</small>
            </label>
            <label className="settings-field">
              <span>Footer Copyright</span>
              <input name="footerCopyright" value={settings.footerCopyright} onChange={updateSetting} />
              <small>Use &#123;year&#125; and &#123;company_name&#125; to insert the current year and business name.</small>
            </label>
          </div>
        </section>

        <section className="settings-card">
          <h2>SEO Settings (Home Page)</h2>
          <div className="settings-card-content">
            <label className="settings-field">
              <span>Meta Title</span>
              <input name="homeMetaTitle" value={settings.homeMetaTitle} onChange={updateSetting} />
            </label>
            <label className="settings-field">
              <span>Meta Description</span>
              <textarea name="homeMetaDescription" rows="3" value={settings.homeMetaDescription} onChange={updateSetting} />
            </label>
            <label className="settings-field">
              <span>Meta Keywords</span>
              <input name="homeMetaKeywords" value={settings.homeMetaKeywords} onChange={updateSetting} />
              <small>Separate with commas</small>
            </label>
          </div>
        </section>

        <section className="settings-card">
          <h2>Social Media Handles</h2>
          <div className="settings-card-content">
            <label className="settings-field">
              <span className="settings-social-label"><FaFacebook className="settings-social-facebook" aria-hidden="true" /> Facebook URL</span>
              <input name="facebookUrl" type="url" value={settings.facebookUrl} onChange={updateSetting} placeholder="https://facebook.com/your-page" />
            </label>
            <label className="settings-field">
              <span className="settings-social-label"><FaInstagram className="settings-social-instagram" aria-hidden="true" /> Instagram URL</span>
              <input name="instagramUrl" type="url" value={settings.instagramUrl} onChange={updateSetting} placeholder="https://instagram.com/your-profile" />
            </label>
            <label className="settings-field">
              <span className="settings-social-label"><FaTwitter className="settings-social-twitter" aria-hidden="true" /> Twitter URL</span>
              <input name="twitterUrl" type="url" value={settings.twitterUrl} onChange={updateSetting} />
            </label>
            <label className="settings-field">
              <span className="settings-social-label"><FaYoutube className="settings-social-youtube" aria-hidden="true" /> YouTube URL</span>
              <input name="youtubeUrl" type="url" value={settings.youtubeUrl} onChange={updateSetting} />
            </label>
          </div>
        </section>

        </div>
        <div className="settings-column settings-right-column">
        <section className="settings-card invoice-settings">
          <h2>Invoice Configuration</h2>
          <div className="settings-card-content">
            <label className="settings-field">
              <span>Invoice Prefix</span>
              <input name="invoicePrefix" value={settings.invoicePrefix} onChange={updateSetting} />
              <small>Example: {settings.invoicePrefix || "INV-"}001</small>
            </label>
            <label className="settings-field">
              <span>Next Invoice Number</span>
              <input name="nextInvoiceNumber" type="number" min="1" value={settings.nextInvoiceNumber} onChange={updateSetting} />
              <small>The sequence will continue from this number.</small>
            </label>
          </div>
        </section>

        <section className="settings-card shipping-settings">
          <h2>Shipping Configuration</h2>
          <div className="settings-card-content">
            <label className="settings-field">
              <span>Default Shipping Charge (₹)</span>
              <input
                name="defaultShippingCharge"
                type="number"
                min="0"
                value={settings.defaultShippingCharge}
                onChange={updateSetting}
              />
            </label>
            <label className="settings-field">
              <span>Free Shipping Threshold (₹)</span>
              <input
                name="freeShippingThreshold"
                type="number"
                min="0"
                value={settings.freeShippingThreshold}
                onChange={updateSetting}
              />
              <small>Set shipping to 0 if order total exceeds this amount.</small>
            </label>
          </div>
        </section>

        <section className="settings-shortcut-card">
          <p>Product listing, reviews, badges, image size, and catalogue tagline settings have moved to their own page.</p>
          <button type="button" className="settings-shortcut-button" onClick={() => navigate("/product-settings")}>
            <FaBoxOpen aria-hidden="true" />
            Product Settings
          </button>
        </section>

        <section className="settings-shortcut-card">
          <p>DTDC and Shiprocket courier settings have moved to their own page.</p>
          <button type="button" className="settings-shortcut-button" onClick={() => navigate("/courier-partners")}>
            <FaTruck aria-hidden="true" />
            Courier Partners Settings
          </button>
        </section>

        <section className="settings-shortcut-card settings-integrations-card">
          <p>SMTP / Email and Payment Gateway settings have moved to their own pages.</p>
          <div className="settings-shortcut-actions">
            <button type="button" className="settings-shortcut-button" onClick={() => navigate("/smtp-email-settings")}>
              <FaEnvelope aria-hidden="true" />
              SMTP / Email Settings
            </button>
            <button type="button" className="settings-shortcut-button" onClick={() => navigate("/payment-gateway-settings")}>
              <FaCreditCard aria-hidden="true" />
              Payment Gateway Settings
            </button>
          </div>
        </section>

        <section className="settings-shortcut-card company-logo-settings">
          <h3>Company Logo</h3>
          {settings.companyLogo ? (
            <img className="company-logo-preview" src={settings.companyLogo} alt="Company logo preview" />
          ) : (
            <div className="company-logo-empty">No logo selected</div>
          )}
          {settings.companyLogo && (
            <button type="button" className="company-logo-remove" onClick={removeCompanyLogo}>
              <FaTimes aria-hidden="true" />
              Remove
            </button>
          )}
          <input
            ref={logoInputRef}
            className="company-logo-input"
            type="file"
            accept="image/*"
            onChange={selectCompanyLogo}
          />
          <button type="button" className="settings-shortcut-button" onClick={() => logoInputRef.current?.click()}>
            <FaImage aria-hidden="true" />
            Select Logo
          </button>
          <div className="company-logo-divider" />
          <h3>Favicon (32x32)</h3>
          {settings.favicon ? (
            <img className="favicon-preview" src={settings.favicon} alt="Favicon preview" />
          ) : (
            <div className="favicon-empty">No favicon selected</div>
          )}
          {settings.favicon && (
            <button type="button" className="company-logo-remove" onClick={removeFavicon}>
              <FaTimes aria-hidden="true" />
              Remove
            </button>
          )}
          <input
            ref={faviconInputRef}
            className="company-logo-input"
            type="file"
            accept="image/*"
            onChange={selectFavicon}
          />
          <button type="button" className="settings-shortcut-button" onClick={() => faviconInputRef.current?.click()}>
            <FaImage aria-hidden="true" />
            Select Favicon
          </button>
        </section>

        </div>
      </div>

      <div className="settings-actions">
        <button type="submit" className="btn btn-primary settings-save-button" disabled={saving}>
          <FaSave aria-hidden="true" />
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>
    </form>
  );
};

export default SettingsPage;