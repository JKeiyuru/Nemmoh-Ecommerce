// server/server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const admin = require("firebase-admin");

// ─── Firebase Admin Initialization ───────────────────────────────────────────
if (!admin.apps.length) {
  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (firebaseConfig.projectId && firebaseConfig.privateKey && firebaseConfig.clientEmail) {
    admin.initializeApp({ credential: admin.credential.cert(firebaseConfig) });
    console.log("✅ Firebase Admin initialised");
  } else {
    console.warn("⚠️  Firebase env vars missing — Firebase auth disabled");
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const adminDeliveryLocationRouter = require("./routes/admin/delivery-location-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const wishlistRouter = require("./routes/shop/wishlist-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");
const mpesaRouter = require("./routes/shop/mpesa-routes");

const app = express();

// ─── Database ─────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cache-Control"],
  })
);

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Cross-Origin headers for Firebase popup auth
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// ─── Rate limiting ────────────────────────────────────────────────────────────
const rateLimit = require("express-rate-limit");
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// ─── Static files ─────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// Admin
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/delivery-locations", adminDeliveryLocationRouter);

// Shop / storefront
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop", mpesaRouter);

// Shared / public
app.use("/api/wishlist", wishlistRouter);
app.use("/api/common/feature", commonFeatureRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.status(200).json({ status: "OK", timestamp: new Date() }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`)
);