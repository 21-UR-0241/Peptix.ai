// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// export default function Signup() {
//   const navigate = useNavigate();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const styles = {
//     page: {
//       minHeight: "100dvh",
//       background:
//         "radial-gradient(1200px 800px at 20% 10%, rgba(167,139,250,0.14), transparent 55%), radial-gradient(900px 600px at 90% 20%, rgba(236,72,153,0.10), transparent 50%), linear-gradient(to bottom, #0a0a0a, #000)",
//       color: "#fff",
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//       padding: "1.5rem",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//     },
//     container: { width: "100%", maxWidth: 520 },
//     card: {
//       background: "rgba(255,255,255,0.03)",
//       border: "1px solid rgba(255,255,255,0.08)",
//       borderRadius: 18,
//       padding: "1.25rem",
//       boxShadow: "0 20px 70px rgba(0,0,0,0.35)",
//     },
//     title: { margin: 0, fontSize: "1.75rem", fontWeight: 950, letterSpacing: "-0.02em" },
//     sub: { marginTop: 8, marginBottom: 0, color: "#9ca3af", lineHeight: 1.6 },
//     form: { marginTop: "1.25rem", display: "grid", gap: "0.85rem" },
//     label: { display: "grid", gap: 6, fontSize: "0.92rem", color: "#cbd5e1", fontWeight: 700 },
//     input: {
//       width: "100%",
//       padding: "0.8rem 0.9rem",
//       borderRadius: 12,
//       border: "1px solid rgba(255,255,255,0.10)",
//       background: "rgba(0,0,0,0.35)",
//       color: "#fff",
//       outline: "none",
//     },
//     primaryBtn: {
//       marginTop: 6,
//       background: "#9333ea",
//       border: "none",
//       color: "white",
//       fontWeight: 900,
//       padding: "0.85rem 1rem",
//       borderRadius: 12,
//       cursor: "pointer",
//       boxShadow: "0 12px 40px rgba(168,85,247,0.18)",
//       opacity: loading ? 0.8 : 1,
//     },
//     link: { color: "#a78bfa", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
//     bottom: { marginTop: 14, color: "#cbd5e1", fontSize: "0.92rem" },
//     subtle: { marginTop: 10, color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5 },
//     danger: {
//       marginTop: 10,
//       padding: "0.75rem 0.85rem",
//       borderRadius: 12,
//       border: "1px solid rgba(239,68,68,0.35)",
//       background: "rgba(239,68,68,0.08)",
//       color: "#fecaca",
//       fontWeight: 700,
//       fontSize: "0.9rem",
//     },
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!name || !email || !password) {
//       setError("Please fill in all fields.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await fetch("/api/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ name, email, password }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok) {
//         setError(data?.error || "Signup failed.");
//         return;
//       }

//       navigate("/scan");
//     } catch {
//       setError("Network error. Is your API server running on :3001?");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={styles.page}>
//       <style>{`
//         input:focus-visible { outline: 2px solid rgba(167,139,250,0.8); outline-offset: 2px; }
//         button:focus-visible { outline: 2px solid rgba(167,139,250,0.8); outline-offset: 2px; }
//       `}</style>

//       <div style={styles.container}>
//         <div style={styles.card}>
//           <h1 style={styles.title}>Create account</h1>
//           <p style={styles.sub}>Sign up to save scans and track progress.</p>

//           {error && <div style={styles.danger}>{error}</div>}

//           <form style={styles.form} onSubmit={onSubmit}>
//             <label style={styles.label}>
//               Full name
//               <input
//                 style={styles.input}
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Jane Doe"
//                 autoComplete="name"
//               />
//             </label>

//             <label style={styles.label}>
//               Email
//               <input
//                 style={styles.input}
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="you@example.com"
//                 autoComplete="email"
//               />
//             </label>

//             <label style={styles.label}>
//               Password
//               <input
//                 style={styles.input}
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 autoComplete="new-password"
//               />
//             </label>

//             <button style={styles.primaryBtn} type="submit" disabled={loading}>
//               {loading ? "Creating..." : "Sign up"}
//             </button>

//             <p style={styles.subtle}>Educational guidance only. Not medical advice.</p>

//             <div style={styles.bottom}>
//               Already have an account? <Link style={styles.link} to="/login">Sign in</Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.js"; // Add this import

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
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
    link: { color: "#a78bfa", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
    bottom: { marginTop: 14, color: "#cbd5e1", fontSize: "0.92rem" },
    subtle: { marginTop: 10, color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5 },
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

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      // Updated to use authService
      const { user } = await authService.signup(name, email, password);
      console.log("✅ Signed up:", user);

      navigate("/scan");
    } catch (err) {
      console.error("❌ Signup error:", err);
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        input:focus-visible { outline: 2px solid rgba(167,139,250,0.8); outline-offset: 2px; }
        button:focus-visible { outline: 2px solid rgba(167,139,250,0.8); outline-offset: 2px; }
      `}</style>

      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.sub}>Sign up to save scans and track progress.</p>

          {error && <div style={styles.danger}>{error}</div>}

          <form style={styles.form} onSubmit={onSubmit}>
            <label style={styles.label}>
              Full name
              <input
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </label>

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
                autoComplete="new-password"
              />
            </label>

            <button style={styles.primaryBtn} type="submit" disabled={loading}>
              {loading ? "Creating..." : "Sign up"}
            </button>

            <p style={styles.subtle}>Educational guidance only. Not medical advice.</p>

            <div style={styles.bottom}>
              Already have an account? <Link style={styles.link} to="/login">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}