
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Microscope,
  Camera,
  LineChart,
  ClipboardCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';
import AnimatedLogo from '../components/AnimatedLogo';

export function LandingPage() {
  const navigate = useNavigate();

  const styles = {
    page: {
      minHeight: '100dvh',
      background:
        'radial-gradient(1200px 800px at 20% 10%, rgba(167,139,250,0.18), transparent 50%), radial-gradient(900px 600px at 90% 20%, rgba(236,72,153,0.14), transparent 45%), linear-gradient(to bottom, #0a0a0a, #000)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflowX: 'hidden',
    },
    container: {
      width: '100%',
      maxWidth: 1120,
      margin: '0 auto',
      padding: '0 1rem',
    },
    nav: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)',
      background: 'rgba(0,0,0,0.55)',
      borderBottom: '1px solid rgba(31,41,55,0.7)',
    },
    navInner: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.9rem 0',
      gap: '1rem',
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: '#cbd5e1',
      fontSize: '0.95rem',
    },
    navLink: {
      background: 'transparent',
      border: 'none',
      color: '#cbd5e1',
      cursor: 'pointer',
      padding: '0.4rem 0.5rem',
      borderRadius: 8,
    },
    primaryBtn: {
      background: 'linear-gradient(90deg, #9333ea, #a855f7, #ec4899)',
      border: 'none',
      color: 'white',
      fontWeight: 800,
      padding: '0.75rem 1rem',
      borderRadius: 12,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      boxShadow: '0 12px 40px rgba(168,85,247,0.18)',
      whiteSpace: 'nowrap',
    },
    secondaryBtn: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.10)',
      color: 'white',
      fontWeight: 750,
      padding: '0.75rem 1rem',
      borderRadius: 12,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      whiteSpace: 'nowrap',
    },
    hero: {
      padding: '3.25rem 0 2.25rem',
    },
    heroGrid: {
      display: 'grid',
      gridTemplateColumns: '1.1fr 0.9fr',
      gap: '2rem',
      alignItems: 'center',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.35rem 0.65rem',
      borderRadius: 999,
      border: '1px solid rgba(167,139,250,0.35)',
      background: 'rgba(167,139,250,0.10)',
      color: '#ddd6fe',
      fontWeight: 700,
      fontSize: '0.85rem',
      marginBottom: '0.85rem',
    },
    h1: {
      fontSize: '3rem',
      lineHeight: 1.05,
      margin: 0,
      fontWeight: 900,
      letterSpacing: '-0.03em',
    },
    heroP: {
      marginTop: '1rem',
      color: '#cbd5e1',
      fontSize: '1.05rem',
      lineHeight: 1.55,
      maxWidth: 620,
    },
    ctaRow: { display: 'flex', gap: '0.75rem', marginTop: '1.35rem', flexWrap: 'wrap' },
    finePrint: {
      marginTop: '0.9rem',
      color: '#94a3b8',
      fontSize: '0.85rem',
      lineHeight: 1.45,
    },
    heroCard: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18,
      padding: '1.1rem',
      overflow: 'hidden',
      position: 'relative',
    },
    heroCardTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      marginBottom: '0.9rem',
    },
    heroCardTitle: { fontWeight: 850, letterSpacing: '-0.01em' },
    chip: {
      fontSize: '0.8rem',
      color: '#ddd6fe',
      border: '1px solid rgba(167,139,250,0.35)',
      background: 'rgba(167,139,250,0.10)',
      borderRadius: 999,
      padding: '0.25rem 0.55rem',
      fontWeight: 750,
      whiteSpace: 'nowrap',
    },
    mock: {
      borderRadius: 14,
      background:
        'linear-gradient(180deg, rgba(147,51,234,0.18), rgba(236,72,153,0.08)), rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '1rem',
    },
    mockRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
    },
    mockLabel: { color: '#cbd5e1', fontSize: '0.9rem' },
    mockValue: { color: '#fff', fontWeight: 850, fontSize: '0.95rem' },
    divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.8rem 0' },
    section: { padding: '2.25rem 0' },
    sectionTitle: {
      fontSize: '1.75rem',
      fontWeight: 900,
      margin: 0,
      letterSpacing: '-0.02em',
    },
    sectionSub: {
      color: '#9ca3af',
      marginTop: '0.6rem',
      marginBottom: 0,
      lineHeight: 1.6,
      maxWidth: 720,
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.9rem',
      marginTop: '1.25rem',
    },
    featureCard: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '1rem',
      minHeight: 140,
    },
    featureTop: { display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' },
    featureTitle: { margin: 0, fontSize: '1rem', fontWeight: 850 },
    featureDesc: { margin: 0, color: '#9ca3af', lineHeight: 1.55, fontSize: '0.93rem' },
    stepsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.9rem',
      marginTop: '1.25rem',
    },
    stepCard: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '1rem',
    },
    stepNum: {
      width: 30,
      height: 30,
      borderRadius: '50%',
      background: '#a78bfa',
      color: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 900,
      fontSize: '0.9rem',
      marginBottom: '0.75rem',
    },
    stepTitle: { margin: 0, fontWeight: 900, fontSize: '1rem' },
    stepDesc: { margin: '0.4rem 0 0', color: '#9ca3af', fontSize: '0.92rem', lineHeight: 1.55 },
    trustRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.9rem',
      marginTop: '1.25rem',
    },
    callout: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '1rem',
    },
    calloutTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      margin: 0,
      fontWeight: 900,
      fontSize: '1rem',
    },
    calloutP: { margin: '0.55rem 0 0', color: '#9ca3af', lineHeight: 1.6, fontSize: '0.93rem' },
    finalCta: {
      padding: '2.5rem 0 3rem',
    },
    finalCard: {
      background: 'linear-gradient(135deg, rgba(147,51,234,0.18), rgba(236,72,153,0.12))',
      border: '1px solid rgba(167,139,250,0.22)',
      borderRadius: 18,
      padding: '1.2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    footer: {
      borderTop: '1px solid rgba(31,41,55,0.7)',
      padding: '1.25rem 0',
      color: '#94a3b8',
      fontSize: '0.85rem',
    },
  };

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={styles.page}>
      {/* Responsive tweaks */}
      <style>{`
        @media (max-width: 980px) {
          .heroGrid { grid-template-columns: 1fr !important; }
          .grid3 { grid-template-columns: 1fr !important; }
          .stepsGrid { grid-template-columns: 1fr 1fr !important; }
          .trustRow { grid-template-columns: 1fr !important; }
          .navLinks { display: none !important; }
        }
        @media (max-width: 520px) {
          .stepsGrid { grid-template-columns: 1fr !important; }
          .h1 { font-size: 2.25rem !important; }
        }
        button:focus-visible {
          outline: 2px solid rgba(167,139,250,0.8);
          outline-offset: 2px;
        }
      `}</style>

      {/* Top Nav */}
      <header style={styles.nav}>
        <div style={styles.container}>
          <div style={styles.navInner}>
            {/* Brand (copied from Header.jsx to match exactly) */}
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: '#ffffff',
                fontSize: '1.5rem',
                fontWeight: '700',
                gap: '0.5rem',
              }}
            >
              <AnimatedLogo size={40} />
              <span
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                PEPTIX
              </span>
            </Link>

            <div className="navLinks" style={styles.navLinks}>
              <button style={styles.navLink} onClick={() => scrollToId('features')}>
                Features
              </button>
              <button style={styles.navLink} onClick={() => scrollToId('how')}>
                How it works
              </button>
              <button style={styles.navLink} onClick={() => scrollToId('trust')}>
                Privacy
              </button>
            </div>

            <button style={styles.primaryBtn} onClick={() => navigate('/login')}>
              Start scan <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <div className="heroGrid" style={styles.heroGrid}>
            <div>
              <div style={styles.badge}>
                <Sparkles size={16} color="#a78bfa" />
                AI-powered peptide recommendations
              </div>

              <h1 className="h1" style={styles.h1}>
                Personalized peptide stacks from a single photo.
              </h1>

              <p style={styles.heroP}>
                PEPTIX analyzes visible markers and body composition cues to generate structured, goal-oriented peptide
                recommendations—organized by category with clear benefits and next steps.
              </p>

              <div style={styles.ctaRow}>
                <button style={styles.primaryBtn} onClick={() => navigate('/login')}>
                  Start scan <ArrowRight size={18} />
                </button>
                <button style={styles.secondaryBtn} onClick={() => scrollToId('how')}>
                  How it works
                </button>
              </div>

              <p style={styles.finePrint}>
                Educational guidance only. Not medical advice. Always consult a qualified clinician before starting any
                regimen.
              </p>
            </div>

            {/* Right mock card */}
            <div style={styles.heroCard}>
              <div style={styles.heroCardTop}>
                <div style={styles.heroCardTitle}>Example output</div>
                <div style={styles.chip}>Instant categories</div>
              </div>

              <div style={styles.mock}>
                <div style={styles.mockRow}>
                  <div style={styles.mockLabel}>Detected focus</div>
                  <div style={styles.mockValue}>Skin / Recovery</div>
                </div>

                <div style={styles.divider} />

                <div style={styles.mockRow}>
                  <div style={styles.mockLabel}>Stack type</div>
                  <div style={styles.mockValue}>Evidence-backed</div>
                </div>

                <div style={styles.divider} />

                <div style={styles.mockRow}>
                  <div style={styles.mockLabel}>Delivery</div>
                  <div style={styles.mockValue}>Guided plan</div>
                </div>

                <div style={{ ...styles.divider, margin: '0.9rem 0' }} />

                <div style={{ display: 'grid', gap: '0.55rem' }}>
                  {[
                    { title: 'Recommendation groups', value: 'Anti-aging, Fat-loss, Performance' },
                    { title: 'Benefit summary', value: 'Short, scannable bullets' },
                    { title: 'Next actions', value: 'Save + rescan to track' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background: '#a78bfa',
                          marginTop: 6,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 850, fontSize: '0.92rem' }}>{row.title}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.45 }}>{row.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  position: 'absolute',
                  inset: '-40% -20% auto auto',
                  width: 260,
                  height: 260,
                  background: 'radial-gradient(circle at 30% 30%, rgba(167,139,250,0.25), transparent 60%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Built for clarity, speed, and trust</h2>
          <p style={styles.sectionSub}>
            A professional experience from scan to recommendation: structured results, smart grouping, and privacy-first
            handling.
          </p>

          <div className="grid3" style={styles.grid3}>
            {[
              {
                icon: <Microscope size={20} color="#a78bfa" />,
                title: 'Science-informed recommendations',
                desc: 'Recommendations are grouped by goal category with concise benefit summaries for faster decision-making.',
              },
              {
                icon: <LineChart size={20} color="#a78bfa" />,
                title: 'Actionable output',
                desc: 'Clear “problems” and “solutions” views help users understand what was detected and what to do next.',
              },
              {
                icon: <Camera size={20} color="#a78bfa" />,
                title: 'Fast capture & upload',
                desc: 'Use your camera or upload an existing photo. Optimized layout for mobile-first scanning.',
              },
              {
                icon: <ShieldCheck size={20} color="#10b981" />,
                title: 'Privacy-first by default',
                desc: 'Images can be kept in-session for your results view. Build with encryption and minimal retention.',
              },
              {
                icon: <ClipboardCheck size={20} color="#a78bfa" />,
                title: 'Organized recommendations',
                desc: 'Stacks are grouped into categories (e.g., recovery, anti-aging, fat-loss) for a cleaner experience.',
              },
              {
                icon: <Lock size={20} color="#a78bfa" />,
                title: 'Designed for responsible use',
                desc: 'Educational framing and disclaimers help users treat results as guidance—not medical direction.',
              },
            ].map((f, idx) => (
              <div key={idx} style={styles.featureCard}>
                <div style={styles.featureTop}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      background: 'rgba(167,139,250,0.12)',
                      border: '1px solid rgba(167,139,250,0.22)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3 style={styles.featureTitle}>{f.title}</h3>
                </div>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>How it works</h2>
          <p style={styles.sectionSub}>A simple flow: capture → analyze → review insights → explore recommendations.</p>

          <div className="stepsGrid" style={styles.stepsGrid}>
            {[
              { n: 1, t: 'Take or upload a photo', d: 'Choose camera mode or upload a clear image aligned with your goal.' },
              { n: 2, t: 'AI analysis', d: 'PEPTIX processes the image and extracts high-level visible markers and cues.' },
              { n: 3, t: 'Problems & strengths', d: 'Review detected issues and already-achieved positives in a clean layout.' },
              { n: 4, t: 'Peptide recommendations', d: 'Get categorized peptides with a quick description and suggested benefits.' },
            ].map((s) => (
              <div key={s.n} style={styles.stepCard}>
                <div style={styles.stepNum}>{s.n}</div>
                <h3 style={styles.stepTitle}>{s.t}</h3>
                <p style={styles.stepDesc}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Privacy */}
      <section id="trust" style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Privacy & responsible use</h2>
          <p style={styles.sectionSub}>
            PEPTIX is designed to be helpful without being misleading—fast insights with privacy-first handling.
          </p>

          <div style={styles.trustRow} className="trustRow">
            <div style={styles.callout}>
              <h3 style={styles.calloutTitle}>
                <ShieldCheck size={20} color="#10b981" />
                Privacy-first design
              </h3>
              <p style={styles.calloutP}>
                Keep results in-session for your viewing experience. Avoid unnecessary storage and minimize exposure.
              </p>
            </div>

            <div style={styles.callout}>
              <h3 style={styles.calloutTitle}>
                <Microscope size={20} color="#a78bfa" />
                Educational guidance
              </h3>
              <p style={styles.calloutP}>
                Recommendations are informational only. Always consult a qualified clinician before starting any peptide
                protocol.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.finalCta}>
        <div style={styles.container}>
          <div style={styles.finalCard}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.02em' }}>
                Ready to get your personalized recommendations?
              </div>
              <div style={{ color: '#cbd5e1', marginTop: 6, lineHeight: 1.55 }}>
                Start a scan in seconds and review a categorized peptide stack.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button style={styles.primaryBtn} onClick={() => navigate('/login')}>
                Start scan <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <footer style={styles.footer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>© {new Date().getFullYear()} PEPTIX. All rights reserved.</div>
              <div style={{ color: '#64748b' }}>Not medical advice. For educational use only.</div>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}