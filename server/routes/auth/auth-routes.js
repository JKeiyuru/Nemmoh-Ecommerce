// server/routes/auth/auth-routes.js

const express = require("express");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} = require("../../controllers/auth/auth-controller");
const { sendWelcomeEmail } = require("../../controllers/common/email-controller");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "CLIENT_SECRET_KEY";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email, userName: user.userName },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

const setCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  return res.cookie("token", token, {
    httpOnly: true,
    secure: isProd, // must be true whenever sameSite is "none"
    sameSite: isProd ? "none" : "lax", // "none" lets the cookie survive a
    // frontend/backend split across different domains — "strict" silently
    // drops it on cross-site requests, which was breaking session persistence
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Firebase Admin Middleware with detailed logging
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization token required" 
      });
    }

    const idToken = authHeader.split(" ")[1];
    
    // Add detailed logging for debugging
    console.log('🔍 Verifying Firebase token...');
    console.log('Token length:', idToken.length);
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('✅ Token verified for user:', decodedToken.email);
    
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    console.error("Error code:", error.code);
    
    let errorMessage = "Invalid authentication token";
    
    if (error.code === 'auth/id-token-expired') {
      errorMessage = "Session expired. Please login again.";
    } else if (error.code === 'auth/argument-error') {
      errorMessage = "Invalid token format";
    } else if (error.code === 'auth/id-token-revoked') {
      errorMessage = "Token has been revoked";
    }
    
    return res.status(401).json({ 
      success: false, 
      message: errorMessage,
      errorCode: error.code 
    });
  }
};

// Traditional auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Firebase Registration Route
router.post("/firebase-register", verifyFirebaseToken, async (req, res) => {
  try {
    const { userName, firebaseUid } = req.body;
    const { uid, email: firebaseEmail } = req.firebaseUser;
    
    console.log('🔐 Firebase Registration - UID:', uid, 'Email:', firebaseEmail);
    
    // Ensure the Firebase UID matches
    if (firebaseUid !== uid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Firebase token"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: firebaseEmail }, { firebaseUid: uid }] 
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists!"
      });
    }

    // Create new user
    const newUser = new User({
      userName,
      email: firebaseEmail, // Use email from Firebase token
      firebaseUid: uid,
      provider: 'firebase'
    });

    await newUser.save();
    console.log('✅ New user created:', newUser.email);

    // Welcome email (non-blocking)
    sendWelcomeEmail(firebaseEmail, { customerName: userName }).catch(err =>
      console.error("⚠️ Welcome email error:", err.message)
    );

    const token = signToken(newUser);
    setCookie(res, token).status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        userName: newUser.userName,
      },
    });
  } catch (error) {
    console.error("❌ Firebase registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Firebase Login Route
router.post("/firebase-login", verifyFirebaseToken, async (req, res) => {
  try {
    const { email, firebaseUid } = req.body;
    const { uid, email: firebaseEmail } = req.firebaseUser;
    
    console.log('🔐 Firebase Login - UID:', uid, 'Email:', firebaseEmail);
    
    // Find user by Firebase UID first, then by email
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      // If not found by firebaseUid, try to find by email
      user = await User.findOne({ email: firebaseEmail });
      console.log('🔍 Firebase login - User lookup by email result:', user ? 'Found existing user' : 'No user found');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log('✅ User found:', user.email, 'Role:', user.role);

    // Update user with Firebase UID if not already set
    if (!user.firebaseUid) {
      console.log('🔄 Updating user with Firebase UID');
      user.firebaseUid = uid;
      user.provider = 'firebase';
      await user.save();
    }

    const token = signToken(user);
    setCookie(res, token).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        userName: user.userName,
      },
    });
  } catch (error) {
    console.error("❌ Firebase login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Social Login Route (Google)
router.post("/social-login", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name } = req.firebaseUser;
    
    console.log('🎉 Social Login - UID:', uid, 'Email:', email, 'Name:', name);

    // Find user by Firebase UID first, then by email
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      // If not found by firebaseUid, try to find by email
      user = await User.findOne({ email });
      console.log('🔍 User lookup by email result:', user ? 'Found existing user' : 'No user found');
    }

    const isNewUser = !user;

    if (!user) {
      console.log('👤 Creating new user for social login');
      
      // Generate a unique username to avoid duplicates
      let userName = name || email.split('@')[0];
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        try {
          // Try to create user with current userName
          user = new User({
            userName: attempts === 0 ? userName : `${userName}${attempts}`,
            email,
            firebaseUid: uid,
            provider: 'google',
            role: 'user'
          });
          await user.save();
          console.log('✅ New social user created:', user.email, 'with userName:', user.userName);
          break;
        } catch (saveError) {
          if (saveError.code === 11000 && saveError.keyValue?.userName) {
            // Duplicate userName, try with a number suffix
            attempts++;
            console.log(`⚠️ Username '${attempts === 1 ? userName : userName + (attempts - 1)}' taken, trying '${userName}${attempts}'`);
            if (attempts >= maxAttempts) {
              throw new Error('Unable to create unique username after multiple attempts');
            }
          } else {
            throw saveError; // Re-throw if it's not a userName duplicate error
          }
        }
      }
    } else if (!user.firebaseUid) {
      console.log('🔄 Updating existing user with Firebase UID');
      // Update existing user with Firebase UID
      user.firebaseUid = uid;
      user.provider = user.provider || 'google';
      await user.save();
      console.log('✅ Updated existing user with Firebase UID:', user.email);
    }

    console.log('✅ Social login successful for user:', user.email, 'Role:', user.role);

    // Send welcome email for genuinely new users
    if (isNewUser) {
      sendWelcomeEmail(email, { customerName: user.userName }).catch(err =>
        console.error("⚠️ Welcome email error:", err.message)
      );
    }

    const token = signToken(user);
    setCookie(res, token).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        userName: user.userName
      }
    });

  } catch (error) {
    console.error('❌ Social login error:', error);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'Authentication failed. Please try another method.';
    let statusCode = 401;
    
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Login session expired. Please try again.';
    } else if (error.name === 'MongoError' || error.name === 'ValidationError') {
      errorMessage = 'Database error. Please try again.';
      statusCode = 500;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      errorCode: error.code,
      errorName: error.name
    });
  }
});

// Authentication Check Route
router.get("/check-auth", async (req, res) => {
  try {
    console.log('🔍 Check auth request received');
    
    // Try Firebase token first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const idToken = authHeader.split(" ")[1];
        console.log('🔥 Trying Firebase token verification...');
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        const user = await User.findOne({ firebaseUid: decodedToken.uid });
        if (user) {
          console.log('✅ Firebase auth check successful for:', user.email);
          return res.status(200).json({
            success: true,
            user: {
              id: user._id,
              role: user.role,
              email: user.email,
              userName: user.userName
            }
          });
        } else {
          console.log('❌ User not found in database for Firebase UID:', decodedToken.uid);
        }
      } catch (firebaseError) {
        console.log("🔄 Firebase token invalid, trying JWT...", firebaseError.message);
      }
    }

    // Fallback to JWT token from cookies
    const token = req.cookies.token;
    if (!token) {
      console.log('❌ No authentication token found');
      return res.status(401).json({
        success: false,
        message: "No authentication token found"
      });
    }

    console.log('🎫 Trying JWT token verification...');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('❌ User not found for JWT token ID:', decoded.id);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log('✅ JWT auth check successful for:', user.email);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName
      }
    });

  } catch (error) {
    console.error("❌ Auth check error:", error);
    res.status(401).json({ 
      success: false, 
      message: "Invalid authentication token" 
    });
  }
});

module.exports = router;