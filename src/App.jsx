import React, { useEffect, useState } from "react";
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
  Authors: "/authors",
  Tags: "/tags",
  "Age Groups": "/age-groups",
  "Product Prices": "/product-prices",
  Settings: "/settings",
  "Courier Partners": "/courier-partners",
  "Product Settings": "/product-settings",
  Locations: "/locations",
  "Admin Users": "/admin-users",
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const routePage =
    Object.keys(pagePaths).find(
      (page) => pagePaths[page] === location.pathname
    ) || "Dashboard";
  const activePage = ["createCategory", "createProduct"].includes(routePage)
    ? routePage === "createCategory" ? "Categories" : "Products"
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
    if (!["/categories", "/products", "/products/new"].includes(location.pathname)) return;

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

  const renderContent = () => {
    switch (routePage) {
      case "Dashboard":
        return <h3>Dashboard Overview</h3>;

      case "Orders":
        return <h3>Orders Page</h3>;

      case "Products":
        return <ProductsPage onAdd={() => navigate("/products/new")} brands={brands} categories={categories || []} />;

      case "createProduct":
        return <CreateProduct onDiscard={() => navigate("/products")} onQuickAddBrand={(brand) => addBrand(brand, false)} brands={brands} categories={categories || []} />;

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
        return <h3>Settings Page</h3>;

      case "Courier Partners":
        return <h3>Courier Partners Page</h3>;

      case "Product Settings":
        return <h3>Product Settings Page</h3>;

      case "Locations":
        return <h3>Locations Page</h3>;

      case "Admin Users":
        return <h3>Admin Users Page</h3>;

      default:
        return <h3>{activePage} Overview</h3>;
    }
  };

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