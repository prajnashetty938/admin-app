import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { ObjectId } from "mongodb";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const uploadsDirectory = path.join(currentDirectory, "uploads");
const brandUploadsDirectory = path.join(uploadsDirectory, "brand");
const categoryUploadsDirectory = path.join(uploadsDirectory, "category");

fs.mkdirSync(brandUploadsDirectory, { recursive: true });
fs.mkdirSync(categoryUploadsDirectory, { recursive: true });

const brandUpload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => callback(null, brandUploadsDirectory),
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 2 * 5024 * 5024 },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Only image files are allowed"));
    }

    callback(null, true);
  },
});

const categoryUpload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => callback(null, categoryUploadsDirectory),
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Only image files are allowed"));
    }

    callback(null, true);
  },
});

const handleBrandUpload = (request, response, next) => {
  brandUpload.single("logo")(request, response, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return response.status(400).json({ error: "Logo must be smaller than 10 MB" });
    }

    return response.status(400).json({ error: error.message || "Invalid logo upload" });
  });
};

const handleCategoryUpload = (request, response, next) => {
  categoryUpload.single("image")(request, response, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return response.status(400).json({ error: "Category image must be smaller than 2 MB" });
    }

    return response.status(400).json({ error: error.message || "Invalid category image" });
  });
};

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(uploadsDirectory));

let db;

const createSlug = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getNextCategoryId = async () => {
  const highestCategory = await db
    .collection("Categories")
    .find({ id: { $type: "number" } })
    .sort({ id: -1 })
    .limit(1)
    .next();
  const highestId = highestCategory?.id || 0;

  await db.collection("Counters").updateOne(
    { _id: "Categories" },
    { $max: { value: highestId } },
    { upsert: true }
  );

  const counter = await db.collection("Counters").findOneAndUpdate(
    { _id: "Categories" },
    { $inc: { value: 1 } },
    { returnDocument: "after" }
  );

  return typeof counter.value === "number" ? counter.value : counter.value.value;
};

const getSavedLogo = (file, logo = "") =>
  file?.filename || (logo.startsWith("data:image/") ? "" : logo);

app.post("/api/brands", handleBrandUpload, async (req, res) => {
  try {
    const {
      name,
      description = "",
      status = "Active",
      logo = "",
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        error: "Brand name is required",
      });
    }

    const brand = {
      name: name.trim(),
      description,
      slug: createSlug(description || name),
      status,
      logo: getSavedLogo(req.file, logo),
      createdAt: new Date(),
    };

    const result = await db.collection("Brands").insertOne(brand);

    res.status(201).json({
      message: "Brand created successfully",
      brand: {
        _id: result.insertedId,
        ...brand,
      },
    });
  } catch (error) {
    console.error("Error inserting brand:", error);

    res.status(500).json({
      error: "Failed to create brand",
    });
  }
});

app.get("/api/brands", async (req, res) => {
  try {
    const brands = await db
      .collection("Brands")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({
      error: "Failed to fetch brands",
    });
  }
});

app.post("/api/categories", handleCategoryUpload, async (req, res) => {
  try {
    const {
      name,
      parentCategory = "",
      description = "",
      sortOrder = "0",
      status = "Active",
      metaTitle = "",
      metaDescription = "",
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const category = {
      id: await getNextCategoryId(),
      name: name.trim(),
      slug: createSlug(name),
      parentCategory,
      description,
      sortOrder: Number(sortOrder) || 0,
      status,
      image: req.file?.filename || "",
      metaTitle,
      metaDescription,
      createdAt: new Date(),
    };

    const result = await db.collection("Categories").insertOne(category);

    res.status(201).json({
      message: "Category created successfully",
      category: { _id: result.insertedId, ...category },
    });
  } catch (error) {
    console.error("Error inserting category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

app.get("/api/categories", async (_req, res) => {
  try {
    const categories = await db
      .collection("Categories")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    let highestId = categories.reduce(
      (currentHighest, category) => Math.max(currentHighest, category.id || 0),
      0
    );

    for (const category of categories) {
      if (typeof category.id === "number") continue;

      highestId += 1;
      category.id = highestId;
      await db.collection("Categories").updateOne(
        { _id: category._id },
        { $set: { id: category.id } }
      );
    }

    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category id" });
    }

    const result = await db.collection("Categories").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully", categoryId: id });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

app.put("/api/categories/:id", handleCategoryUpload, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category id" });
    }

    const {
      name,
      parentCategory = "",
      description = "",
      sortOrder = "0",
      status = "Active",
      metaTitle = "",
      metaDescription = "",
      imageName = "",
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const updatedCategory = {
      name: name.trim(),
      slug: createSlug(name),
      parentCategory,
      description,
      sortOrder: Number(sortOrder) || 0,
      status,
      image: req.file?.filename || imageName,
      metaTitle,
      metaDescription,
      updatedAt: new Date(),
    };

    const result = await db.collection("Categories").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedCategory }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const category = await db.collection("Categories").findOne({ _id: new ObjectId(id) });
    res.json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

app.put("/api/brands/:id", handleBrandUpload, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid brand id" });
    }

    const {
      name,
      description = "",
      status = "Active",
      logo = "",
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        error: "Brand name is required",
      });
    }

    const updatedBrand = {
      name: name.trim(),
      description,
      slug: createSlug(description || name),
      status,
      logo: getSavedLogo(req.file, logo),
      updatedAt: new Date(),
    };

    const result = await db.collection("Brands").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedBrand }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const brand = await db
      .collection("Brands")
      .findOne({ _id: new ObjectId(id) });

    res.json({
      message: "Brand updated successfully",
      brand,
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({
      error: "Failed to update brand",
    });
  }
});

app.delete("/api/brands/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid brand id" });
    }

    const result = await db.collection("Brands").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.json({
      message: "Brand deleted successfully",
      brandId: id,
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({
      error: "Failed to delete brand",
    });
  }
});

async function startServer() {
  try {
    db = await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

startServer();