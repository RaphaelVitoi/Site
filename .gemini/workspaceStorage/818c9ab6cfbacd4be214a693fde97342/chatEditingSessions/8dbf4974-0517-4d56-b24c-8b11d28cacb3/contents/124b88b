'use client';

import React from 'react';

interface SectionHeaderProps {
  step: string;
  label: string;
  title: string;
  description: string;
}

export function SectionHeader({ step, label, title, description }: SectionHeaderProps) {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 1.5rem 1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem' }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 800,
          color: '#818cf8',
          fontFamily: "'JetBrains Mono', monospace",
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '0.2rem 0.6rem',
          borderRadius: '6px',
        }}>
          {step}
        </span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          {label}
        </span>
      </div>
      <h2 style={{
        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
        fontWeight: 800,
        margin: '0 0 0.75rem',
        letterSpacing: '-0.02em',
        color: '#f8fafc',
      }}>
        {title}
      </h2>
      <p style={{
        margin: 0,
        fontSize: '0.9rem',
        color: '#64748b',
        lineHeight: 1.6,
        maxWidth: '780px',
      }}>
        {description}
      </p>
    </div>
  );
}
