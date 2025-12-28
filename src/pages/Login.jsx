

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const styles = {
    page: {
      minHeight: "100dvh",
      background:
        "radial-gradient(1200px 800px at 20% 10%, rgba(167,139,250,0.14), transparent 55%), radial-gradient(900px 600px at 90% 20%, rgba(236,72,153,0.10), transparent 50%), linear-gradient(to bottom, #0a0a0a, #000)",
      color: "#fff",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: "1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    container: { width: "100%", maxWidth: 520 },
    card: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: "1.25rem",
      boxShadow: "0 20px 70px rgba(0,0,0,0.35)",
    },
    title: { margin: 0, fontSize: "1.75rem", fontWeight: 950, letterSpacing: "-0.02em" },
    sub: { marginTop: 8, marginBottom: 0, color: "#9ca3af", lineHeight: 1.6 },
    form: { marginTop: "1.25rem", display: "grid", gap: "0.85rem" },
    label: { display: "grid", gap: 6, fontSize: "0.92rem", color: "#cbd5e1", fontWeight: 700 },
    input: {
      width: "100%",
      padding: "0.8rem 0.9rem",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.35)",
      color: "#fff",
      outline: "none",
    },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
    checkboxRow: { display: "inline-flex", alignItems: "center", gap: 8, color: "#cbd5e1", fontSize: "0.9rem" },
    link: { color: "#a78bfa", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
    primaryBtn: {
      marginTop: 6,
      background: "#9333ea",
      border: "none",
      color: "white",
      fontWeight: 900,
      padding: "0.85rem 1rem",
      borderRadius: 12,
      cursor: "pointer",
      boxShadow: "0 12px 40px rgba(168,85,247,0.18)",
      opacity: loading ? 0.8 : 1,
    },
    googleBtn: {
      width: "100%",
      background: "rgba(255,255,255,0.95)",
      border: "1px solid rgba(0,0,0,0.08)",
      color: "#1f2937",
      fontWeight: 700,
      padding: "0.85rem 1rem",
      borderRadius: 12,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      fontSize: "0.95rem",
      transition: "all 0.2s",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "1.25rem 0",
      color: "#64748b",
      fontSize: "0.85rem",
      fontWeight: 700,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      background: "rgba(255,255,255,0.1)",
    },
    subtle: { marginTop: 10, color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5 },
    bottom: { marginTop: 14, color: "#cbd5e1", fontSize: "0.92rem" },
    danger: {
      marginTop: 10,
      padding: "0.75rem 0.85rem",
      borderRadius: 12,
      border: "1px solid rgba(239,68,68,0.35)",
      background: "rgba(239,68,68,0.08)",
      color: "#fecaca",
      fontWeight: 700,
      fontSize: "0.9rem",
    },
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Login failed.");
        return;
      }

      navigate("/scan");
    } catch {
      setError("Network error. Is your API server running on :3001?");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to your backend Google OAuth endpoint
    window.location.href = "/api/auth/google";
  };

  return (
    <div style={styles.page}>
      <style>{`
        input:focus-visible { outline: 2px solid rgba(167,139,250,0.8); outline-offset: 2px; }
        button:focus-visible { outline: 2px solid rgba(167,139,250,0.8); outline-offset: 2px; }
        .google-btn:hover { background: rgba(255,255,255,1); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
      `}</style>

      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Sign in</h1>
          <p style={styles.sub}>Access your scans, results, and saved recommendations.</p>

          {error && <div style={styles.danger}>{error}</div>}

          <button 
            className="google-btn"
            style={styles.googleBtn} 
            onClick={handleGoogleLogin}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            OR
            <div style={styles.dividerLine}></div>
          </div>

          <form style={styles.form} onSubmit={onSubmit}>
            <label style={styles.label}>
              Email
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label style={styles.label}>
              Password
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            <div style={styles.row}>
              <label style={styles.checkboxRow}>
                <input type="checkbox" />
                Remember me
              </label>

              <Link style={styles.link} to="/">
                Back to landing
              </Link>
            </div>

            <button style={styles.primaryBtn} type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p style={styles.subtle}>
              By signing in, you agree this app provides educational guidance only and is not medical advice.
            </p>

            <div style={styles.bottom}>
              Don&apos;t have an account? <Link style={styles.link} to="/signup">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}