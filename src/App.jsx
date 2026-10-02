import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import DashboardHeader from "./components/DashboardHeader.jsx";
import ProductCollections from "./components/ProductCollections.jsx";
import CreateCollection from "./components/CreateCollection.jsx";
import BrandsPage from "./components/BrandsPage.jsx";
import CreateBrand from "./components/CreateBrand.jsx";
import CreateCategory from "./components/CreateCategory.jsx";
import CategoriesPage from "./components/CategoriesPage.jsx";
import CreateProduct from "./components/CreateProduct.jsx";
import ProductsPage from "./components/ProductsPage.jsx";
import BannersPage from "./components/BannersPage.jsx";
import CreateBanner from "./components/CreateBanner.jsx";
import SettingsPage from "./components/SettingsPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import "./App.css";

const API_URL = "http://localhost:5000/api";

const createBrandFormData = (brandData) => {
  const formData = new FormData();

  formData.append("name", brandData.name);
  formData.append("description", brandData.description);
  formData.append("status", brandData.status);

  if (brandData.logoFile) {
    formData.append("logo", brandData.logoFile);
  } else if (brandData.logo && !brandData.logo.startsWith("data:image/")) {
    formData.append("logo", brandData.logo);
  }

  return formData;
};

const createCategoryFormData = (categoryData) => {
  const formData = new FormData();

  formData.append("name", categoryData.name);
  formData.append("parentCategory", categoryData.parentCategory);
  formData.append("description", categoryData.description);
  formData.append("sortOrder", categoryData.sortOrder);
  formData.append("status", categoryData.status);
  formData.append("metaTitle", categoryData.metaTitle);
  formData.append("metaDescription", categoryData.metaDescription);

  if (categoryData.image) {
    formData.append("image", categoryData.image);
  } else if (categoryData.imageName) {
    formData.append("imageName", categoryData.imageName);
  }

  return formData;
};

const pagePaths = {
  Dashboard: "/",
  Orders: "/orders",
  Products: "/products",
  createProduct: "/products/new",
  Collections: "/collections",
  "Create Collection": "/collections/new",
  Categories: "/categories",
  createCategory: "/categories/new",
  Brands: "/brands",
  createBrand: "/brands/new",
  Banners: "/banners",
  createBanner: "/banners/new",
  Authors: "/authors",
  Tags: "/tags",
  "Age Groups": "/age-groups",
  "Product Prices": "/product-prices",
  Settings: "/settings",
  "Courier Partners": "/courier-partners",
  "Product Settings": "/product-settings",
  "SMTP / Email Settings": "/smtp-email-settings",
  "Payment Gateway Settings": "/payment-gateway-settings",
  Locations: "/locations",
  "Admin Users": "/admin-users",
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (location.pathname === "/login") {
      if (token) {
        navigate("/");
      }
      return;
    }

    if (!token) {
      navigate("/login");
    }
  }, [location.pathname, navigate]);

  const routePage =
    Object.keys(pagePaths).find(
      (page) => pagePaths[page] === location.pathname
    ) || "Dashboard";
  const activePage = ["createCategory", "createProduct", "createBanner"].includes(routePage)
    ? routePage === "createCategory" ? "Categories" : routePage === "createProduct" ? "Products" : "Banners"
    : routePage;

  const loadBrands = async () => {
    try {
      setLoadingBrands(true);

      const response = await fetch(`${API_URL}/brands`);

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const data = await response.json().catch(() => ({}));
      setBrands(data);
    } catch (error) {
      console.error(error);
      alert("Unable to load brands");
    } finally {
      setLoadingBrands(false);
    }
  };

  useEffect(() => {
    if (!["/brands", "/products", "/products/new"].includes(location.pathname)) return;
    loadBrands();
  }, [location.pathname]);

  useEffect(() => {
    if (!["/categories", "/products", "/products/new", "/banners", "/banners/new"].includes(location.pathname)) return;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(`${API_URL}/categories`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch categories");
        }

        setCategories(data);
      } catch (error) {
        console.error(error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [location.pathname]);

  const setActivePage = (page) => {
    navigate(pagePaths[page] || "/");
  };

  const addBrand = async (newBrand, shouldNavigate = true) => {
    try {
      const response = await fetch(`${API_URL}/brands`, {
        method: "POST",
        body: createBrandFormData(newBrand),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to create brand");
      }

      setBrands((currentBrands) => [data.brand, ...currentBrands]);
      if (shouldNavigate) {
        await loadBrands();
        navigate("/brands");
      }
      return data.brand;
    } catch (error) {
      console.error("Create brand error:", error);
      throw error;
    }
  };

  const addProduct = async (product, featuredImage, media) => {
    const formData = new FormData();
    formData.append("product", JSON.stringify(product));
    if (featuredImage) formData.append("featuredImage", featuredImage);
    media.forEach((file) => formData.append("media", file));

    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to save product");
    }

    return data.product;
  };

  const updateProduct = async (productId, product, featuredImage, media) => {
    const formData = new FormData();
    formData.append("product", JSON.stringify(product));
    if (featuredImage) formData.append("featuredImage", featuredImage);
    media.forEach((file) => formData.append("media", file));

    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "PUT",
      body: formData,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to update product");
    }

    return data.product;
  };

  const deleteProduct = async (productId) => {
    const response = await fetch(`${API_URL}/products/${productId}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to delete product");
    }
  };

  const updateProductsStatus = async (productIds, status) => {
    const response = await fetch(`${API_URL}/products/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds, status }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to update product statuses");
    }
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    navigate("/products/new");
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    navigate("/products/new");
  };

  const updateBrand = async (brandId, updatedBrand) => {
    try {
      const response = await fetch(`${API_URL}/brands/${brandId}`, {
        method: "PUT",
        body: createBrandFormData(updatedBrand),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to update brand");
      }

      setBrands((currentBrands) =>
        currentBrands.map((brand) =>
          brand._id === brandId ? data.brand : brand
        )
      );

      setEditingBrand(null);
      navigate("/brands");
    } catch (error) {
      console.error("Update brand error:", error);
      throw error;
    }
  };

  const addCategory = async (categoryData) => {
    const response = await fetch(`${API_URL}/categories`, {
      method: "POST",
      body: createCategoryFormData(categoryData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to create category");
    }

    setCategories((currentCategories) => [
      data.category,
      ...(currentCategories || []),
    ]);
    navigate("/categories");
  };

  const updateCategory = async (categoryId, categoryData) => {
    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: "PUT",
      body: createCategoryFormData(categoryData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to update category");
    }

    setCategories((currentCategories) =>
      (currentCategories || []).map((category) =>
        category._id === categoryId ? data.category : category
      )
    );
    setEditingCategory(null);
    navigate("/categories");
  };

  const deleteCategory = async (categoryId) => {
    const confirmed = window.confirm("Are you sure you want to delete this category?");
    if (!confirmed) return;

    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete category");
    }

    setCategories((currentCategories) =>
      (currentCategories || []).filter((category) => category._id !== categoryId)
    );
  };

  const openCreateCategory = () => {
    setEditingCategory(null);
    navigate("/categories/new");
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    navigate("/categories/new");
  };

  const deleteBrand = async (brandId) => {
    const confirmed = window.confirm("Are you sure you want to delete this brand?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/brands/${brandId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to delete brand");
      }

      setBrands((currentBrands) =>
        currentBrands.filter((brand) => brand._id !== brandId)
      );
    } catch (error) {
      console.error("Delete brand error:", error);
      alert(error.message || "Failed to delete brand");
    }
  };

  const openCreateBrand = () => {
    setEditingBrand(null);
    navigate("/brands/new");
  };

  const openEditBrand = (brand) => {
    setEditingBrand(brand);
    navigate("/brands/new");
  };

  const createBannerFormData = (bannerData) => {
    const formData = new FormData();
    formData.append(
      "banner",
      JSON.stringify({
        title: bannerData.title,
        subtitle: bannerData.subtitle,
        destinationUrl: bannerData.destinationUrl,
        ctaText: bannerData.ctaText,
        category: bannerData.category,
        position: bannerData.position,
        sortOrder: bannerData.sortOrder,
        active: bannerData.active,
        images: bannerData.images || {},
      })
    );

    if (bannerData.desktopImage) formData.append("desktopImage", bannerData.desktopImage);
    if (bannerData.mobileImage) formData.append("mobileImage", bannerData.mobileImage);
    if (bannerData.tabletImage) formData.append("tabletImage", bannerData.tabletImage);

    return formData;
  };

  const loadBanners = async () => {
    try {
      setLoadingBanners(true);
      const response = await fetch(`${API_URL}/banners`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch banners");
      }

      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setBanners([]);
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    if (!["/banners", "/banners/new"].includes(location.pathname)) return;
    loadBanners();
  }, [location.pathname]);

  const addBanner = async (bannerData) => {
    const response = await fetch(`${API_URL}/banners`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
      },
      body: createBannerFormData(bannerData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to create banner");
    }

    setBanners((currentBanners) => [data.banner, ...currentBanners]);
    navigate("/banners");
  };

  const updateBanner = async (bannerId, bannerData) => {
    const response = await fetch(`${API_URL}/banners/${bannerId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
      },
      body: createBannerFormData(bannerData),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to update banner");
    }

    setBanners((currentBanners) =>
      currentBanners.map((banner) =>
        banner._id === bannerId ? data.banner : banner
      )
    );

    setEditingBanner(null);
    navigate("/banners");
  };

  const deleteBanner = async (bannerId) => {
    const confirmed = window.confirm("Are you sure you want to delete this banner?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/banners/${bannerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to delete banner");
      }

      setBanners((currentBanners) =>
        currentBanners.filter((banner) => banner._id !== bannerId)
      );
    } catch (error) {
      console.error("Delete banner error:", error);
      alert(error.message || "Failed to delete banner");
    }
  };

  const openEditBanner = (banner) => {
    setEditingBanner(banner);
    navigate("/banners/new");
  };

  const renderContent = () => {
    switch (routePage) {
      case "Dashboard":
        return <h3>Dashboard Overview</h3>;

      case "Orders":
        return <h3>Orders Page</h3>;

      case "Products":
        return <ProductsPage onAdd={openCreateProduct} onEdit={openEditProduct} onDelete={deleteProduct} onBulkStatusChange={updateProductsStatus} brands={brands} categories={categories || []} />;

      case "createProduct":
        return <CreateProduct onDiscard={() => { setEditingProduct(null); navigate("/products"); }} onQuickAddBrand={(brand) => addBrand(brand, false)} onSave={editingProduct ? (...args) => updateProduct(editingProduct._id, ...args) : addProduct} initialData={editingProduct} brands={brands} categories={categories || []} />;

      case "Collections":
        return <ProductCollections setActivePage={setActivePage} />;

      case "Create Collection":
        return <CreateCollection setActivePage={setActivePage} />;

      case "Brands":
        return loadingBrands ? (
          <p>Loading brands...</p>
        ) : (
          <BrandsPage
            brands={brands}
            onAdd={openCreateBrand}
            onEdit={openEditBrand}
            onDelete={deleteBrand}
          />
        );

      case "Banners":
        return loadingBanners ? (
          <p>Loading banners...</p>
        ) : (
          <BannersPage
            banners={banners}
            onAdd={() => {
              setEditingBanner(null);
              navigate("/banners/new");
            }}
            onEdit={openEditBanner}
            onDelete={deleteBanner}
          />
        );

      case "createBanner":
        return (
          <CreateBanner
            initialData={editingBanner}
            mode={editingBanner ? "edit" : "create"}
            categories={categories || []}
            onBack={() => {
              setEditingBanner(null);
              navigate("/banners");
            }}
            onSubmit={
              editingBanner
                ? (payload) => updateBanner(editingBanner._id, payload)
                : addBanner
            }
          />
        );

      case "createBrand":
        return (
          <CreateBrand
            onSubmit={
              editingBrand
                ? (brandData) => updateBrand(editingBrand._id, brandData)
                : addBrand
            }
            initialData={editingBrand}
            mode={editingBrand ? "edit" : "create"}
            onBack={() => {
              setEditingBrand(null);
              navigate("/brands");
            }}
          />
        );

      case "Categories":
        return loadingCategories ? (
          <p>Loading categories...</p>
        ) : (
          <CategoriesPage
            categories={categories}
            onAdd={openCreateCategory}
            onEdit={openEditCategory}
            onDelete={deleteCategory}
          />
        );

      case "createCategory":
        return (
          <CreateCategory
            onSubmit={
              editingCategory
                ? (categoryData) => updateCategory(editingCategory._id, categoryData)
                : addCategory
            }
            initialData={editingCategory}
            mode={editingCategory ? "edit" : "create"}
            onBack={() => {
              setEditingCategory(null);
              navigate("/categories");
            }}
          />
        );

      case "Authors":
        return <h3>Authors Page</h3>;

      case "Tags":
        return <h3>Tags Page</h3>;

      case "Age Groups":
        return <h3>Age Groups Page</h3>;

      case "Product Prices":
        return <h3>Product Prices Page</h3>;

      case "Settings":
        return <SettingsPage />;

      case "Courier Partners":
        return <h3>Courier Partners Page</h3>;

      case "Product Settings":
        return <h3>Product Settings Page</h3>;

      case "SMTP / Email Settings":
        return <h3>SMTP / Email Settings Page</h3>;

      case "Payment Gateway Settings":
        return <h3>Payment Gateway Settings Page</h3>;

      case "Locations":
        return <h3>Locations Page</h3>;

      case "Admin Users":
        return <h3>Admin Users Page</h3>;

      default:
        return <h3>{activePage} Overview</h3>;
    }
  };

  if (location.pathname === "/login") {
    return <LoginPage />;
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div style={{ flex: 1 }}>
        <DashboardHeader activePage={activePage} />

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}