// server/controllers/auth/auth-controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../../models/User");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../common/email-controller");

const CLIENT_URL = process.env.CLIENT_URL || "https://kenyamagictoyshop.com";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email, userName: user.userName },
    process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
    { expiresIn: "7d" }
  );

const setCookieAndRespond = (res, user, statusCode = 200, extraData = {}) => {
  const token = signToken(user);
  const isProd = process.env.NODE_ENV === "production";
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: isProd, // must be true whenever sameSite is "none"
      sameSite: isProd ? "none" : "lax", // "none" lets the cookie survive a
      // frontend/backend split across different domains (e.g. a custom
      // domain frontend + a Render-hosted API) — "strict" silently drops it
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(statusCode)
    .json({
      success: true,
      user: { id: user._id, email: user.email, role: user.role, userName: user.userName },
      ...extraData,
    });
};

// Register (Traditional method)
const registerUser = async (req, res) => {
  const { userName, email, password, firebaseUid } = req.body;

  try {
    // Check if user exists by email or Firebase UID
    const existingUser = await User.findOne({
      $or: [{ email }, ...(firebaseUid ? [{ firebaseUid }] : [])],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email!",
      });
    }

    // Validate required fields
    if (!userName || !email) {
      return res.status(400).json({
        success: false,
        message: "Username and email are required",
      });
    }

    // For traditional registration, password is required
    if (!firebaseUid && !password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const newUser = new User({
      userName,
      email,
      ...(password && { password: await bcrypt.hash(password, 12) }),
      ...(firebaseUid && { firebaseUid, provider: 'firebase' }),
    });

    await newUser.save();

    // Welcome email (non-blocking)
    sendWelcomeEmail(email, { customerName: userName }).catch(err =>
      console.error("⚠️ Welcome email error:", err.message)
    );

    setCookieAndRespond(res, newUser, 201, { message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login (Traditional method)
const loginUser = async (req, res) => {
  const { email, password, firebaseUid } = req.body;

  try {
    // Find user by email or Firebase UID
    const user = await User.findOne({
      $or: [{ email }, ...(firebaseUid ? [{ firebaseUid }] : [])],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please check your email or register first.",
      });
    }

    // Verify password if not using Firebase auth
    if (!firebaseUid) {
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: "This account was created with Google. Please use Google sign-in.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid password. Please try again.",
        });
      }
    }

    setCookieAndRespond(res, user, 200, { message: "Logged in successfully" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Forgot password — sends a branded reset email via Brevo.
// Works for both Firebase-auth accounts (uses Firebase's reset link generator)
// and traditional local-password accounts (uses our own signed token).
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Always respond with a generic success message so we don't leak
    // which emails are registered.
    const genericResponse = {
      success: true,
      message: "If an account exists with that email, a reset link has been sent.",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    if (user.firebaseUid) {
      // Firebase-authenticated account — generate a Firebase reset link,
      // but deliver it through our own branded Brevo email.
      try {
        const admin = require("firebase-admin");
        const resetLink = await admin.auth().generatePasswordResetLink(email, {
          url: `${CLIENT_URL}/auth/login`,
        });

        sendPasswordResetEmail(email, {
          customerName: user.userName,
          resetLink,
        }).catch((err) => console.error("⚠️ Password reset email error:", err.message));
      } catch (firebaseError) {
        console.error("❌ Firebase reset link error:", firebaseError.message);
      }

      return res.status(200).json(genericResponse);
    }

    // Local (non-Firebase) account — issue our own signed, expiring token.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetLink = `${CLIENT_URL}/auth/reset-password/${rawToken}?email=${encodeURIComponent(email)}`;

    sendPasswordResetEmail(email, {
      customerName: user.userName,
      resetLink,
    }).catch((err) => console.error("⚠️ Password reset email error:", err.message));

    res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Reset password — completes a local-account reset using the token emailed above.
const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout
const logoutUser = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

// Enhanced Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Check Firebase token first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const admin = require("firebase-admin");
        const idToken = authHeader.split(" ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        const user = await User.findOne({ firebaseUid: decodedToken.uid });
        if (user) {
          req.user = {
            id: user._id,
            role: user.role,
            email: user.email,
            userName: user.userName,
          };
          return next();
        }
      } catch (firebaseError) {
        console.log("Firebase token verification failed, trying JWT...");
      }
    }

    // Fallback to JWT token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");

    // Verify user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      userName: user.userName,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Authentication token expired. Please login again.",
      });
    }

    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  forgotPassword,
  resetPassword,
};