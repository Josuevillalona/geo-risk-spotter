import React from 'react';

/**
 * Custom markdown components for consistent styling across chat messages.
 * Provides accessible, well-styled rendering for ReactMarkdown components.
 */
const markdownComponents = {
  h1: ({ children }) => (
    <h1 style={{
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#1f2937',
      marginTop: '1rem',
      marginBottom: '0.75rem'
    }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginTop: '1rem',
      marginBottom: '0.5rem'
    }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginTop: '1rem',
      marginBottom: '0.5rem'
    }}>
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 style={{
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1f2937',
      marginTop: '0.75rem',
      marginBottom: '0.5rem'
    }}>
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 style={{
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#1f2937',
      marginTop: '0.5rem',
      marginBottom: '0.25rem'
    }}>
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 style={{
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginTop: '0.5rem',
      marginBottom: '0.25rem'
    }}>
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p style={{
      marginBottom: '0.75rem',
      color: '#374151',
      lineHeight: '1.6'
    }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul style={{
      marginBottom: '0.75rem',
      paddingLeft: '1rem'
    }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{
      marginBottom: '0.75rem',
      paddingLeft: '1rem',
      listStyleType: 'decimal'
    }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{
      color: '#374151',
      lineHeight: '1.6',
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '0.5rem',
      listStyle: 'none'
    }}>
      <span style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        backgroundColor: '#2E8B57',
        borderRadius: '50%',
        marginRight: '0.75rem',
        marginTop: '0.6rem',
        flexShrink: 0
      }}></span>
      <span style={{ flex: 1 }}>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong style={{
      fontWeight: '600',
      color: '#111827'
    }}>
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em style={{
      fontStyle: 'italic',
      color: '#374151'
    }}>
      {children}
    </em>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: '4px solid #d1fae5',
      paddingLeft: '1rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      margin: '0.75rem 0',
      backgroundColor: '#f0fdf4',
      borderRadius: '0 0.5rem 0.5rem 0'
    }}>
      {children}
    </blockquote>
  ),
  code: ({ children, inline }) => {
    if (inline) {
      return (
        <code style={{
          backgroundColor: '#f3f4f6',
          color: '#374151',
          padding: '0.125rem 0.25rem',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        }}>
          {children}
        </code>
      );
    }
    return (
      <pre style={{
        backgroundColor: '#f3f4f6',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        margin: '0.75rem 0',
        overflowX: 'auto'
      }}>
        <code style={{
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          color: '#374151'
        }}>
          {children}
        </code>
      </pre>
    );
  }
};

export default markdownComponents;
