// theme.js
function getThemeStyles(isDragging, isLoading, hasResult) {
  return {
    container: {
      height: '100%',
      width: '100%',
      padding: '24px',
      backgroundColor: 'var(--background-primary)',
      color: 'var(--text-normal)',
      fontFamily: 'var(--font-interface)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      overflowY: 'auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      margin: 0,
      fontSize: '28px',
      fontWeight: '300',
      color: 'var(--text-normal)',
      letterSpacing: '2px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    section: {
      backgroundColor: 'var(--background-secondary)',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid var(--background-modifier-border)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '16px',
      color: 'var(--text-normal)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      letterSpacing: '1px'
    },
    button: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: 'var(--interactive-accent)',
      color: 'var(--text-on-accent)',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      justifyContent: 'center'
    },
    buttonHover: {
      opacity: 0.9,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    radioGroup: {
      display: 'flex',
      gap: '20px',
      marginBottom: '20px'
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      color: 'var(--text-normal)',
      padding: '10px 16px',
      backgroundColor: 'var(--background-primary)',
      borderRadius: '8px',
      border: '1px solid var(--background-modifier-border)',
      transition: 'all 0.2s ease'
    },
    radioLabelActive: {
      backgroundColor: 'var(--background-modifier-hover)',
      borderColor: 'var(--interactive-accent)'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid var(--background-modifier-border)',
      backgroundColor: 'var(--background-modifier-form-field)',
      color: 'var(--text-normal)',
      fontSize: '14px',
      marginBottom: '16px',
      cursor: 'pointer',
      fontFamily: 'var(--font-interface)',
      fontWeight: '400'
    },
    imagePreview: {
      width: '100%',
      maxHeight: '500px',
      objectFit: 'contain',
      border: '2px solid var(--background-modifier-border)',
      borderRadius: '12px',
      backgroundColor: 'var(--background-primary)',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    },
    dropZone: {
      padding: '60px 40px',
      border: isDragging ? '2px dashed var(--interactive-accent)' : '2px dashed var(--background-modifier-border)',
      borderRadius: '12px',
      textAlign: 'center',
      backgroundColor: isDragging ? 'var(--background-modifier-hover)' : 'var(--background-primary)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: isDragging ? 'scale(1.02)' : 'none'
    },
    dropZoneContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      color: 'var(--text-normal)'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: 'var(--background-modifier-border)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '16px'
    },
    progressFill: {
      height: '100%',
      backgroundColor: 'var(--interactive-accent)',
      transition: 'width 0.3s ease'
    },
    textArea: {
      width: '100%',
      minHeight: '250px',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid var(--background-modifier-border)',
      backgroundColor: 'var(--background-modifier-form-field)',
      color: 'var(--text-normal)',
      fontSize: '13px',
      fontFamily: 'var(--font-monospace)',
      resize: 'vertical',
      boxSizing: 'border-box',
      lineHeight: '1.6'
    },
    error: {
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 82, 82, 0.1)',
      border: '1px solid rgba(255, 82, 82, 0.3)',
      color: '#ff5252',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px'
    },
    info: {
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: 'var(--background-modifier-hover)',
      border: '1px solid var(--background-modifier-border)',
      color: 'var(--text-normal)',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    dragOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--background-primary)',
      border: '3px dashed var(--interactive-accent)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: 'var(--text-normal)',
      pointerEvents: 'none',
      opacity: isDragging ? 0.9 : 0,
      visibility: isDragging ? 'visible' : 'hidden',
      transition: 'opacity 0.2s ease, visibility 0.2s ease'
    }
  };
}

return { getThemeStyles };
