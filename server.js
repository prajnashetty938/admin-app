import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "./db.js";

const app = express(); //create an instance of express app
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super-admin-secret-key";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const uploadsDirectory = path.join(currentDirectory, "uploads");
const brandUploadsDirectory = path.join(uploadsDirectory, "brand");
const categoryUploadsDirectory = path.join(uploadsDirectory, "category");
const productUploadsDirectory = path.join(uploadsDirectory, "product");
const bannerUploadsDirectory = path.join(uploadsDirectory, "banner");

fs.mkdirSync(brandUploadsDirectory, { recursive: true });
fs.mkdirSync(categoryUploadsDirectory, { recursive: true });
fs.mkdirSync(productUploadsDirectory, { recursive: true });
fs.mkdirSync(bannerUploadsDirectory, { recursive: true });

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

const productUpload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => callback(null, productUploadsDirectory),
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Only image files are allowed"));
    }

    callback(null, true);
  },
});

const bannerUpload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => callback(null, bannerUploadsDirectory),
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Only image files are allowed"));
    }

    callback(null, true);
  },
});

const handleProductUpload = (request, response, next) => {
  productUpload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "media", maxCount: 10 },
  ])(request, response, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return response.status(400).json({ error: "Product images must be smaller than 10 MB" });
    }

    return response.status(400).json({ error: error.message || "Invalid product image upload" });
  });
};

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

const handleBannerUpload = (request, response, next) => {
  bannerUpload.fields([
    { name: "desktopImage", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
    { name: "tabletImage", maxCount: 1 },
  ])(request, response, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return response.status(400).json({ error: "Banner images must be smaller than 10 MB" });
    }

    return response.status(400).json({ error: error.message || "Invalid banner image upload" });
  });
};

app.use(cors());
app.use(express.json({ limit: "8mb" }));
app.use("/uploads", express.static(uploadsDirectory));

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication token is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

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

const getNextProductId = async () => {
  const highestProduct = await db
    .collection("Products")
    .find({ id: { $type: "number" } })
    .sort({ id: -1 })
    .limit(1)
    .next();
  const highestId = highestProduct?.id || 0;

  await db.collection("Counters").updateOne(
    { _id: "Products" },
    { $max: { value: highestId } },
    { upsert: true }
  );

  const counter = await db.collection("Counters").findOneAndUpdate(
    { _id: "Products" },
    { $inc: { value: 1 } },
    { returnDocument: "after" }
  );

  return typeof counter.value === "number" ? counter.value : counter.value.value;
};

const getSavedLogo = (file, logo = "") =>
  file?.filename || (logo.startsWith("data:image/") ? "" : logo);

const ensureDefaultAdmin = async () => {
  const adminsCollection = db.collection("Admins");
  const existingAdmin = await adminsCollection.findOne({ email: ADMIN_EMAIL });

  if (existingAdmin) {
    return existingAdmin;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const result = await adminsCollection.insertOne({
    name: "Super Admin",
    email: ADMIN_EMAIL,
    passwordHash,
    role: "super_admin",
    createdAt: new Date(),
  });

  return adminsCollection.findOne({ _id: result.insertedId });
};

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const admin = await db.collection("Admins").findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(String(password), admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/admin/me", verifyToken, async (req, res) => {
  try {
    const admin = await db.collection("Admins").findOne({ _id: new ObjectId(req.admin.id) });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin profile error:", error);
    res.status(500).json({ error: "Unable to fetch admin profile" });
  }
});

app.get("/api/settings/global", verifyToken, async (_req, res) => {
  try {
    const record = await db.collection("Settings").findOne({ _id: "global" });
    res.json({ settings: record?.settings || null });
  } catch (error) {
    console.error("Error fetching global settings:", error);
    res.status(500).json({ error: "Failed to fetch global settings" });
  }
});

const publicSettingFields = [
  "companyName",
  "address",
  "phone",
  "email",
  "defaultCountryCode",
  "defaultShippingCharge",
  "freeShippingThreshold",
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "pageBackground",
  "headerBackground",
  "headerTextColor",
  "footerBackground",
  "footerTextColor",
  "categoriesButtonEnabled",
  "categoriesButtonBackground",
  "categoriesButtonTextColor",
  "utilityBarBackground",
  "menuBarBackground",
  "menuTextColor",
  "promotionBarBackground",
  "promotionBarText",
  "companyLogo",
  "favicon",
  "utilityTopBarEnabled",
  "promotionBarEnabled",
  "shopByAgeEnabled",
  "whatsappEnquiryEnabled",
  "whatsappNumber",
  "footerTagline",
  "footerCopyright",
  "homeMetaTitle",
  "homeMetaDescription",
  "homeMetaKeywords",
  "facebookUrl",
  "instagramUrl",
  "twitterUrl",
  "youtubeUrl",
];

app.get("/api/public/settings", async (_req, res) => {
  try {
    const record = await db.collection("Settings").findOne({ _id: "global" });
    const publicSettings = record?.settings
      ? Object.fromEntries(
          publicSettingFields
            .filter((field) => Object.hasOwn(record.settings, field))
            .map((field) => [field, record.settings[field]])
        )
      : null;

    res.json({ settings: publicSettings });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    res.status(500).json({ error: "Failed to fetch public settings" });
  }
});

app.put("/api/settings/global", verifyToken, async (req, res) => {
  try {
    const settings = req.body?.settings;
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      return res.status(400).json({ error: "Settings must be a JSON object" });
    }

    await db.collection("Settings").updateOne(
      { _id: "global" },
      { $set: { settings, updatedAt: new Date(), updatedBy: req.admin.id } },
      { upsert: true }
    );

    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Error saving global settings:", error);
    res.status(500).json({ error: "Failed to save global settings" });
  }
});

app.post("/api/products", handleProductUpload, async (req, res) => {
  try {
    const productData = JSON.parse(req.body.product || "{}");

    if (!productData.name?.trim()) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const product = {
      ...productData,
      id: await getNextProductId(),
      name: productData.name.trim(),
      slug: createSlug(productData.name),
      featuredImage: req.files?.featuredImage?.[0]?.filename || "",
      media: (req.files?.media || []).map((file) => file.filename),
      createdAt: new Date(),
    };
    const result = await db.collection("Products").insertOne(product);

    res.status(201).json({
      message: "Product created successfully",
      product: { _id: result.insertedId, ...product },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: "Invalid product data" });
    }

    console.error("Error inserting product:", error);
    res.status(500).json({ error: "Failed to save product" });
  }
});

app.put("/api/products/:id", handleProductUpload, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const productData = JSON.parse(req.body.product || "{}");
    if (!productData.name?.trim()) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const updatedProduct = {
      ...productData,
      name: productData.name.trim(),
      slug: createSlug(productData.name),
      featuredImage: req.files?.featuredImage?.[0]?.filename || productData.featuredImage || "",
      media: req.files?.media
        ? req.files.media.map((file) => file.filename)
        : productData.media || [],
      updatedAt: new Date(),
    };
    const result = await db.collection("Products").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedProduct }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = await db.collection("Products").findOne({ _id: new ObjectId(id) });
    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: "Invalid product data" });
    }

    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const result = await db.collection("Products").deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully", productId: id });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

app.patch("/api/products/status", async (req, res) => {
  try {
    const { productIds, status } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "Select at least one product" });
    }
    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid product status" });
    }
    if (!productIds.every((id) => ObjectId.isValid(id))) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const result = await db.collection("Products").updateMany(
      { _id: { $in: productIds.map((id) => new ObjectId(id)) } },
      { $set: { status, updatedAt: new Date() } }
    );

    res.json({ message: "Product statuses updated successfully", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error updating product statuses:", error);
    res.status(500).json({ error: "Failed to update product statuses" });
  }
});

app.get("/api/products", async (_req, res) => {
  try {
    const products = await db
      .collection("Products")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/customers/checkout", async (req, res) => {
  try {
    const cleanString = (value) => typeof value === "string" ? value.trim() : "";
    const email = cleanString(req.body.email).toLowerCase();
    const firstName = cleanString(req.body.firstName);
    const lastName = cleanString(req.body.lastName);
    const phone = cleanString(req.body.phone);
    const paymentMethod = cleanString(req.body.paymentMethod);
    const phoneDigits = phone.replace(/\D/g, "");
    const shippingAddress = req.body.shippingAddress || {};
    const billingAddress = req.body.billingSameAsShipping
      ? shippingAddress
      : req.body.billingAddress || {};
    const requiredAddressFields = ["address", "city", "state", "postalCode"];

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "A valid email address is required" });
    }
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First and last name are required" });
    }
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return res.status(400).json({ error: "Enter a valid phone number" });
    }
    if (paymentMethod !== "cod") {
      return res.status(400).json({ error: "Online payment is not configured. Select Cash on Delivery." });
    }
    if (requiredAddressFields.some((field) => !cleanString(shippingAddress[field]))) {
      return res.status(400).json({ error: "Complete the shipping address fields" });
    }
    if (requiredAddressFields.some((field) => !cleanString(billingAddress[field]))) {
      return res.status(400).json({ error: "Complete the billing address fields" });
    }

    if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty" });
    }

    const items = req.body.items.map((item) => {
      const name = cleanString(item.name);
      const price = Number(String(item.price ?? 0).replace(/[^0-9.-]/g, ""));
      const quantity = Number(item.quantity);

      if (!name || !Number.isFinite(price) || price < 0 || !Number.isSafeInteger(quantity) || quantity < 1) {
        throw new Error("Invalid cart item");
      }

      return {
        productId: ObjectId.isValid(item.productId) ? new ObjectId(item.productId) : null,
        name,
        price,
        quantity,
        lineTotal: price * quantity,
      };
    });
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const now = new Date();
    const customer = {
      email,
      firstName,
      lastName,
      phone,
      shippingAddress: {
        address: cleanString(shippingAddress.address),
        apartment: cleanString(shippingAddress.apartment),
        city: cleanString(shippingAddress.city),
        state: cleanString(shippingAddress.state),
        postalCode: cleanString(shippingAddress.postalCode),
      },
      billingAddress: {
        sameAsShipping: req.body.billingSameAsShipping === true,
        firstName: cleanString(billingAddress.firstName) || firstName,
        lastName: cleanString(billingAddress.lastName) || lastName,
        address: cleanString(billingAddress.address),
        apartment: cleanString(billingAddress.apartment),
        city: cleanString(billingAddress.city),
        state: cleanString(billingAddress.state),
        postalCode: cleanString(billingAddress.postalCode),
      },
      marketingOptIn: req.body.marketingOptIn === true,
      saveInformation: req.body.saveInformation === true,
      updatedAt: now,
    };

    await db.collection("Customers").updateOne(
      { email },
      { $set: customer, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );

    const orderNumber = `INV-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    const order = {
      orderNumber,
      customerEmail: email,
      customerName: `${firstName} ${lastName}`,
      phone,
      shippingAddress: customer.shippingAddress,
      billingAddress: customer.billingAddress,
      items,
      subtotal: total,
      shipping: 0,
      tax: 0,
      total,
      paymentMethod: "Cash on Delivery",
      status: "Pending",
      estimatedDelivery: "5-7 business days",
      createdAt: now,
    };
    const result = await db.collection("Orders").insertOne(order);

    res.status(201).json({
      message: "Order placed successfully",
      orderId: result.insertedId,
      orderNumber,
      total,
    });
  } catch (error) {
    console.error("Error saving checkout customer:", error);
    if (error.message === "Invalid cart item") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to save customer information" });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const order = await db.collection("Orders").findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          orderNumber: 1,
          items: 1,
          subtotal: 1,
          shipping: 1,
          tax: 1,
          total: 1,
          status: 1,
          estimatedDelivery: 1,
          createdAt: 1,
        },
      }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order confirmation:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.get("/api/banners", async (_req, res) => {
  try {
    const banners = await db
      .collection("Banners")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

app.get("/api/public/banners", async (_req, res) => {
  try {
    const banners = await db
      .collection("Banners")
      .find({ active: true, position: "hero" })
      .sort({ sortOrder: 1, createdAt: -1 })
      .project({
        title: 1,
        subtitle: 1,
        destinationUrl: 1,
        ctaText: 1,
        sortOrder: 1,
        images: 1,
      })
      .toArray();

    res.json(banners);
  } catch (error) {
    console.error("Error fetching public banners:", error);
    res.status(500).json({ error: "Failed to fetch public banners" });
  }
});

app.get("/api/public/states", async (_req, res) => {
  try {
    const states = await db
      .collection("States")
      .find({ name: { $type: "string" }, code: { $type: "string" } })
      .sort({ name: 1 })
      .project({ _id: 0, name: 1, code: 1 })
      .toArray();

    res.json(states);
  } catch (error) {
    console.error("Error fetching public states:", error);
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

app.post("/api/banners", handleBannerUpload, async (req, res) => {
  try {
    const bannerData = JSON.parse(req.body.banner || "{}");

    if (!bannerData.title?.trim()) {
      return res.status(400).json({ error: "Banner title is required" });
    }

    const banner = {
      title: bannerData.title.trim(),
      subtitle: String(bannerData.subtitle || "").trim(),
      destinationUrl: String(bannerData.destinationUrl || "").trim(),
      ctaText: String(bannerData.ctaText || "").trim(),
      category: String(bannerData.category || "").trim(),
      position: String(bannerData.position || "hero").trim() || "hero",
      sortOrder: Number(bannerData.sortOrder) || 0,
      active: Boolean(bannerData.active),
      images: {
        desktop: req.files?.desktopImage?.[0]?.filename || bannerData.images?.desktop || "",
        mobile: req.files?.mobileImage?.[0]?.filename || bannerData.images?.mobile || "",
        tablet: req.files?.tabletImage?.[0]?.filename || bannerData.images?.tablet || "",
      },
      createdAt: new Date(),
    };

    const result = await db.collection("Banners").insertOne(banner);

    res.status(201).json({
      message: "Banner created successfully",
      banner: { _id: result.insertedId, ...banner },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: "Invalid banner data" });
    }

    console.error("Error inserting banner:", error);
    res.status(500).json({ error: "Failed to create banner" });
  }
});

app.put("/api/banners/:id", handleBannerUpload, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid banner id" });
    }

    const bannerData = JSON.parse(req.body.banner || "{}");

    if (!bannerData.title?.trim()) {
      return res.status(400).json({ error: "Banner title is required" });
    }

    const updatedBanner = {
      title: bannerData.title.trim(),
      subtitle: String(bannerData.subtitle || "").trim(),
      destinationUrl: String(bannerData.destinationUrl || "").trim(),
      ctaText: String(bannerData.ctaText || "").trim(),
      category: String(bannerData.category || "").trim(),
      position: String(bannerData.position || "hero").trim() || "hero",
      sortOrder: Number(bannerData.sortOrder) || 0,
      active: Boolean(bannerData.active),
      images: {
        desktop: req.files?.desktopImage?.[0]?.filename || bannerData.images?.desktop || "",
        mobile: req.files?.mobileImage?.[0]?.filename || bannerData.images?.mobile || "",
        tablet: req.files?.tabletImage?.[0]?.filename || bannerData.images?.tablet || "",
      },
      updatedAt: new Date(),
    };

    const result = await db.collection("Banners").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedBanner }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }

    const banner = await db.collection("Banners").findOne({ _id: new ObjectId(id) });
    res.json({ message: "Banner updated successfully", banner });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: "Invalid banner data" });
    }

    console.error("Error updating banner:", error);
    res.status(500).json({ error: "Failed to update banner" });
  }
});

app.delete("/api/banners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid banner id" });
    }

    const result = await db.collection("Banners").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res.json({ message: "Banner deleted successfully", bannerId: id });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ error: "Failed to delete banner" });
  }
});

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
    await ensureDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔐 Default admin account: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

startServer();