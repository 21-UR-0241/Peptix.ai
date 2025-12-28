

import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { and, eq, gt, isNull, desc } from "drizzle-orm";
import { db } from "./db.js";
import { users, authSessions, analysisHistory } from "../src/db/schema.mts";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cloudinary from './cloudinary.js';

const router = Router();

// ============================================================================
// GOOGLE OAUTH CONFIGURATION
// ============================================================================

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.name?.givenName || "User";

        if (!email) {
          return done(new Error("No email from Google"), null);
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user exists
        let existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        let user;

        if (existingUser.length) {
          // User exists, use existing user
          user = existingUser[0];
          console.log("✅ Existing Google user logged in:", user.email);
        } else {
          // Create new user (Google users don't need a password hash)
          const inserted = await db
            .insert(users)
            .values({
              name,
              email: normalizedEmail,
              passwordHash: "", // Empty for Google OAuth users
            })
            .returning({ id: users.id, email: users.email, name: users.name });

          user = inserted[0];
          console.log("✅ New Google user created:", user.email);
        }

        return done(null, user);
      } catch (error) {
        console.error("❌ Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
  };
}

async function getUserFromRequest(req) {
  const rawToken = req.cookies?.peptix_session;
  if (!rawToken) return null;

  const refreshTokenHash = sha256(String(rawToken));

  const sessionRows = await db
    .select({ userId: authSessions.userId })
    .from(authSessions)
    .where(
      and(
        eq(authSessions.refreshTokenHash, refreshTokenHash),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!sessionRows.length) return null;

  const userRows = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, sessionRows[0].userId))
    .limit(1);

  return userRows[0] || null;
}

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Signup
router.post("/auth/signup", async (req, res) => {
  console.log("🚀 Signup route hit");
  console.log("📦 Body received:", req.body);
  
  try {
    const { name, email, password } = req.body ?? {};
    
    if (!name || !email || !password) {
      console.log("❌ Missing fields");
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    console.log("✉️ Checking if email exists:", normalizedEmail);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);
    
    if (existing.length) {
      console.log("❌ Email already in use");
      return res.status(400).json({ error: "EMAIL_IN_USE" });
    }

    console.log("🔒 Hashing password...");
    const passwordHash = await bcrypt.hash(String(password), 10);

    console.log("💾 Inserting user into database...");
    const inserted = await db
      .insert(users)
      .values({ name: String(name), email: normalizedEmail, passwordHash })
      .returning({ id: users.id, email: users.email, name: users.name });

    const user = inserted[0];
    console.log("✅ User created:", user.id);

    const rawToken = makeToken();
    const refreshTokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    console.log("🎫 Creating session...");
    await db
      .insert(authSessions)
      .values({ userId: user.id, refreshTokenHash, expiresAt });

    res.cookie("peptix_session", rawToken, { 
      ...cookieOptions(), 
      expires: expiresAt 
    });
    console.log("✅ Signup complete");
    
    return res.json({ user });
  } catch (e) {
    console.error("💥 ERROR in signup:", e);
    console.error("Stack:", e.stack);
    return res.status(500).json({ error: e?.message || "SIGNUP_FAILED" });
  }
});

// Login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    
    if (!email || !password) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);
      
    if (!rows.length) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const u = rows[0];
    const ok = await bcrypt.compare(String(password), u.passwordHash);
    
    if (!ok) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const rawToken = makeToken();
    const refreshTokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await db
      .insert(authSessions)
      .values({ userId: u.id, refreshTokenHash, expiresAt });

    res.cookie("peptix_session", rawToken, { 
      ...cookieOptions(), 
      expires: expiresAt 
    });
    
    return res.json({ 
      user: { 
        id: u.id, 
        email: u.email, 
        name: u.name 
      } 
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: e?.message || "LOGIN_FAILED" });
  }
});


// Add this route after the update-profile route

// Change password
router.put("/auth/change-password", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });

    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "PASSWORD_TOO_SHORT" });
    }

    // Get user with password hash
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userRows.length) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    const fullUser = userRows[0];

    // Check if user has a password (Google users might not)
    if (!fullUser.passwordHash) {
      return res.status(400).json({ 
        error: "GOOGLE_ACCOUNT",
        message: "Google accounts cannot change password. Please use Google to sign in."
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(String(currentPassword), fullUser.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: "INVALID_CURRENT_PASSWORD" });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(String(newPassword), 10);

    // Update password
    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, user.id));

    console.log("✅ Password changed for user:", user.id);

    return res.json({ success: true });
  } catch (e) {
    console.error("Change password error:", e);
    return res.status(500).json({ error: e?.message || "CHANGE_PASSWORD_FAILED" });
  }
});


// ============================================================================
// GOOGLE OAUTH ROUTES
// ============================================================================

// Initiate Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google OAuth callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        console.log("❌ No user from Google OAuth");
        const frontendUrl = process.env.CLIENT_ORIGIN || "http://localhost:5173";
        return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
      }

      // Create session token
      const rawToken = makeToken();
      const refreshTokenHash = sha256(rawToken);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

      await db
        .insert(authSessions)
        .values({ userId: user.id, refreshTokenHash, expiresAt });

      res.cookie("peptix_session", rawToken, {
        ...cookieOptions(),
        expires: expiresAt,
      });

      console.log("✅ Google OAuth successful for:", user.email);

      // Redirect to FRONTEND scan page
      const frontendUrl = process.env.CLIENT_ORIGIN || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/scan`);
    } catch (error) {
      console.error("❌ Error in Google callback:", error);
      const frontendUrl = process.env.CLIENT_ORIGIN || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/login?error=session_failed`);
    }
  }
);

// Get current user
router.get("/auth/me", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ user: null });
    return res.json({ user });
  } catch (e) {
    console.error("Get user error:", e);
    return res.status(500).json({ error: e?.message || "ME_FAILED" });
  }
});

// Logout
router.post("/auth/logout", async (req, res) => {
  try {
    const rawToken = req.cookies?.peptix_session;

    if (rawToken) {
      const refreshTokenHash = sha256(String(rawToken));
      await db
        .update(authSessions)
        .set({ revokedAt: new Date() })
        .where(eq(authSessions.refreshTokenHash, refreshTokenHash));
    }

    res.clearCookie("peptix_session", cookieOptions());
    return res.json({ ok: true });
  } catch (e) {
    console.error("Logout error:", e);
    return res.status(500).json({ error: e?.message || "LOGOUT_FAILED" });
  }
});

// Update profile
router.put("/auth/update-profile", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });

    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "NAME_REQUIRED" });

    const updated = await db
      .update(users)
      .set({ name: String(name).trim() })
      .where(eq(users.id, user.id))
      .returning({ id: users.id, email: users.email, name: users.name });

    return res.json({ user: updated[0] });
  } catch (e) {
    console.error("Update profile error:", e);
    return res.status(500).json({ error: e?.message || "UPDATE_FAILED" });
  }
});

// ============================================================================
// CLAUDE AI ROUTES
// ============================================================================

// Claude API proxy
// Claude API proxy
router.post("/claude", async (req, res) => {
  try {
    const { image, prompt } = req.body ?? {};
    
    if (!image || !prompt) {
      return res.status(400).json({ error: "MISSING_IMAGE_OR_PROMPT" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY_MISSING" });
    }

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", // ✅ Updated model
        max_tokens: 4096, // Increased from 3000
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { 
                type: "image", 
                source: { 
                  type: "base64", 
                  media_type: "image/jpeg", 
                  data: image 
                } 
              },
            ],
          },
        ],
      }),
    });

    const text = await resp.text();
    if (!resp.ok) return res.status(resp.status).send(text);

    res.type("json").send(text);
  } catch (e) {
    console.error("Claude API error:", e);
    return res.status(500).json({ error: e?.message || "CLAUDE_PROXY_FAILED" });
  }
});

// ============================================================================
// HISTORY ROUTES
// ============================================================================

// Get user's analysis history
router.get("/history", async (req, res) => {
  console.log("📊 History GET request received");
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      console.log("❌ Unauthorized history access attempt");
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    console.log("✅ Fetching history for user:", user.id);

    const history = await db
      .select()
      .from(analysisHistory)
      .where(eq(analysisHistory.userId, user.id))
      .orderBy(desc(analysisHistory.createdAt));

    console.log(`✅ Found ${history.length} history items`);
    return res.json({ history });
  } catch (e) {
    console.error("❌ Error fetching history:", e);
    return res.status(500).json({ error: e?.message || "FETCH_HISTORY_FAILED" });
  }
});

// Save analysis to history
router.post("/history", async (req, res) => {
  console.log("💾 History POST request received");
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      console.log("❌ Unauthorized history save attempt");
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const { productName, analysis, imageUrl, healthScore } = req.body;
    
    if (!analysis) {
      console.log("❌ Missing analysis field");
      return res.status(400).json({ error: "ANALYSIS_REQUIRED" });
    }

    console.log("✅ Saving history for user:", user.id);
    console.log("📝 Product:", productName || "N/A");
    console.log("💯 Health Score:", healthScore || "N/A");

    const inserted = await db
      .insert(analysisHistory)
      .values({
        userId: user.id,
        productName: productName || null,
        analysis: String(analysis),
        imageUrl: imageUrl || null,
        healthScore: healthScore ? parseInt(healthScore) : null
      })
      .returning();

    console.log("✅ History saved with ID:", inserted[0].id);
    return res.json({ history: inserted[0] });
  } catch (e) {
    console.error("❌ Error saving history:", e);
    console.error("Stack:", e.stack);
    return res.status(500).json({ error: e?.message || "SAVE_HISTORY_FAILED" });
  }
});

// Delete history item
router.delete("/history/:id", async (req, res) => {
  console.log("🗑️ History DELETE request received");
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      console.log("❌ Unauthorized history delete attempt");
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const { id } = req.params;
    console.log("🗑️ Deleting history item:", id, "for user:", user.id);

    await db
      .delete(analysisHistory)
      .where(
        and(
          eq(analysisHistory.id, parseInt(id)),
          eq(analysisHistory.userId, user.id)
        )
      );

    console.log("✅ History item deleted");
    return res.json({ ok: true });
  } catch (e) {
    console.error("❌ Error deleting history:", e);
    return res.status(500).json({ error: e?.message || "DELETE_HISTORY_FAILED" });
  }
});



// TEMPORARY: Simple upload route that just returns a data URL
router.post("/upload-image", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "NO_IMAGE_PROVIDED" });
    }

    console.log("📸 Upload route hit - returning base64 as URL");

    // For now, just return the base64 image as the URL
    // We'll add Cloudinary later
    return res.json({
      url: image, // Use the base64 directly
      publicId: "temp-" + Date.now(),
      width: 1000,
      height: 1000
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return res.status(500).json({ 
      error: error?.message || "UPLOAD_FAILED" 
    });
  }
});

// Delete image from Cloudinary (optional, for cleanup)
router.delete("/delete-image/:publicId", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });

    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ error: "NO_PUBLIC_ID_PROVIDED" });
    }

    console.log("🗑️ Deleting image from Cloudinary:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    console.log("✅ Image deleted from Cloudinary");

    return res.json({ success: true, result });
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error);
    return res.status(500).json({ 
      error: error?.message || "CLOUDINARY_DELETE_FAILED" 
    });
  }
});

// ============================================================================
// EXPORT
// ============================================================================

export default router;