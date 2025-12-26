
import React from 'react';
import { Sparkles, Shield, AlertCircle, Cpu } from 'lucide-react';

function About() {
  const page = {
    minHeight: '100dvh',
    background: '#0a0a0a',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    justifyContent: 'center',
  };

  const container = {
    width: '100%',
    maxWidth: 1100,
    padding: '1rem',
    paddingBottom: '1.25rem',
  };

  const headerWrap = {
    marginBottom: '1rem',
    textAlign: 'center',
  };

  const h1 = {
    fontSize: '1.6rem',
    fontWeight: 800,
    margin: 0,
    marginBottom: '0.35rem',
    letterSpacing: '-0.02em',
  };

  const subtitle = {
    color: '#9ca3af',
    margin: 0,
    fontSize: '0.95rem',
    lineHeight: 1.35,
  };

  const card = {
    background: '#151515',
    border: '1px solid #242424',
    borderRadius: 16,
    padding: '1rem',
    marginBottom: '0.75rem', // tighter spacing between sections
  };

  const sectionTitle = {
    fontSize: '1.15rem',
    fontWeight: 800,
    margin: 0,
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    letterSpacing: '-0.01em',
  };

  const p = {
    color: '#d1d5db',
    lineHeight: 1.6,
    margin: 0,
    fontSize: '0.95rem',
  };

  const mutedP = {
    color: '#9ca3af',
    lineHeight: 1.6,
    margin: 0,
    fontSize: '0.92rem',
  };

  const categories = [
    {
      icon: '🌟',
      title: 'Skin & Anti-Aging',
      description:
        'Our AI analyzes facial skin for wrinkles, fine lines, texture, hydration, dark spots, and aging signs. We recommend peptides like Matrixyl, Argireline, and Copper Peptides for skin rejuvenation.',
    },
    {
      icon: '💪',
      title: 'Muscle Building & Growth',
      description:
        'For physique images, we assess muscle definition, body composition, and development potential. Recommended peptides include IGF-1 LR3, CJC-1295, Ipamorelin, and GHRP-6.',
    },
    {
      icon: '⚡',
      title: 'Weight Loss & Metabolism',
      description:
        'Body composition analysis helps identify fat loss opportunities. We recommend peptides like AOD-9604, Fragment 176-191, and Tesamorelin for metabolic enhancement.',
    },
    {
      icon: '🏃',
      title: 'Fitness & Performance',
      description:
        'For athletes and fitness enthusiasts, we recommend performance-enhancing peptides like BPC-157, TB-500, and Epithalon for recovery and endurance.',
    },
  ];

  const steps = [
    { step: '1', title: 'Image Upload', description: 'Take or upload a photo relevant to your health goal' },
    { step: '2', title: 'AI Analysis', description: 'Advanced AI examines the image comprehensively' },
    { step: '3', title: 'Smart Detection', description: "System identifies whether it's skin, muscle, fitness, or body composition" },
    { step: '4', title: 'Personalized Recommendations', description: 'Receive specific peptide recommendations with detailed benefits' },
  ];

  const peptideCategories = [
    { title: 'Anti-Aging Peptides', description: 'Collagen production, wrinkle reduction, skin repair' },
    { title: 'Muscle Growth Peptides', description: 'Hypertrophy, strength, lean mass development' },
    { title: 'Fat Loss Peptides', description: 'Lipolysis, metabolism boost, body recomposition' },
    { title: 'Recovery Peptides', description: 'Tissue repair, inflammation reduction, healing' },
    { title: 'Performance Peptides', description: 'Endurance, stamina, athletic optimization' },
    { title: 'Wellness Peptides', description: 'Overall health, longevity, vitality' },
  ];

  return (
    <div style={page}>
      <div style={container}>
        {/* Header */}
        <div style={headerWrap}>
          <h1 style={h1}>About PEPTIX</h1>
          <p style={subtitle}>AI-powered peptide optimization platform</p>
        </div>

        {/* Intro + What are Peptides */}
        <div style={card}>
          <p style={p}>
            PEPTIX is an innovative AI-powered platform designed to revolutionize health and fitness optimization
            through advanced image analysis and comprehensive peptide science.
          </p>

          <div
            style={{
              marginTop: '0.85rem',
              background: 'rgba(167, 139, 250, 0.10)',
              border: '1px solid rgba(167, 139, 250, 0.28)',
              borderRadius: 14,
              padding: '0.9rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.05rem',
                fontWeight: 850,
                margin: 0,
                marginBottom: '0.5rem',
                color: '#a78bfa',
              }}
            >
              What are Peptides?
            </h2>
            <p style={p}>
              Peptides are short chains of amino acids that serve as building blocks of proteins. They act as
              signaling molecules in the body, triggering specific biological responses for health, fitness, and
              wellness optimization.
            </p>
          </div>
        </div>

        {/* Analysis Categories */}
        <div style={card}>
          <h2 style={sectionTitle}>
            <Sparkles size={22} color="#a78bfa" />
            Analysis Categories
          </h2>

          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {categories.map((category, idx) => (
              <div
                key={idx}
                style={{
                  background: '#0e0e0e',
                  border: '1px solid #262626',
                  borderRadius: 14,
                  padding: '0.9rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 750,
                    margin: 0,
                    marginBottom: '0.45rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{category.icon}</span>
                  {category.title}
                </h3>
                <p style={mutedP}>{category.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div style={card}>
          <h2 style={{ ...sectionTitle, marginBottom: '0.85rem' }}>How PEPTIX Works</h2>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {steps.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: '#a78bfa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    color: '#0a0a0a',
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <div style={{ fontWeight: 750, fontSize: '0.98rem', marginBottom: 4 }}>
                    {item.title}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.45 }}>
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peptide Categories */}
        <div style={card}>
          <h2 style={{ ...sectionTitle, marginBottom: '0.85rem' }}>Peptide Categories We Cover</h2>

          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {peptideCategories.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#0e0e0e',
                  border: '1px solid #262626',
                  borderRadius: 14,
                  padding: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: 4 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#a78bfa',
                      flexShrink: 0,
                    }}
                  />
                  <strong style={{ fontSize: '0.95rem' }}>{item.title}</strong>
                </div>
                <p style={{ ...mutedP, paddingLeft: '0.95rem' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Security */}
        <div style={card}>
          <h2 style={sectionTitle}>
            <Shield size={22} color="#10b981" />
            Privacy & Security
          </h2>
          <p style={mutedP}>
            Your privacy is our top priority. All images are analyzed securely through encrypted connections and are
            never stored on our servers. Analysis results are kept only in your browser session and automatically
            deleted when you close the application.
          </p>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.10)',
            border: '1px solid rgba(239, 68, 68, 0.28)',
            borderRadius: 16,
            padding: '1rem',
            marginBottom: '0.75rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 900,
              margin: 0,
              marginBottom: '0.75rem',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
            }}
          >
            <AlertCircle size={22} />
            Important Disclaimer
          </h2>
          <p style={{ color: '#fca5a5', lineHeight: 1.6, margin: 0, fontSize: '0.93rem' }}>
            <strong>Medical Disclaimer:</strong> PEPTIX provides educational information and product recommendations
            based on AI analysis. This is NOT medical advice. Peptide usage should be discussed with qualified
            healthcare professionals. Always consult with a doctor, dermatologist, or licensed healthcare provider
            before starting any peptide regimen. This service is for informational purposes only.
          </p>
        </div>

        {/* Technology */}
        <div style={card}>
          <h2 style={sectionTitle}>
            <Cpu size={22} color="#a78bfa" />
            Our Technology
          </h2>
          <p style={mutedP}>
            PEPTIX uses state-of-the-art AI models including Claude and Gemini to provide accurate, science-backed
            recommendations. Our system is continuously updated with the latest peptide research and clinical studies.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;