// App.jsx
const activeFile = dc.resolvePath("OCR READER") || "_RESOURCES/DATACORE/_DONE/OCR READER/OCR READER";
const folderPath = activeFile.substring(0, activeFile.lastIndexOf('/'));

const { useState, useEffect, useRef } = dc;

const { loadScript } = await dc.require(folderPath + "/src/utils/loadScript.js");
const { findNearestAncestorWithClass, findDirectChildByClass } = await dc.require(folderPath + "/src/utils/domUtils.js");

function App() {
  // OCR process states
  const [ocrText, setOcrText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [tesseractLoaded, setTesseractLoaded] = useState(false);

  // Image source state: 'vault', 'upload', or 'paste'
  const [imageSource, setImageSource] = useState('vault');

  // Vault image selection states
  const [selectedVaultFilePath, setSelectedVaultFilePath] = useState('');
  const [vaultImageFiles, setVaultImageFiles] = useState([]);

  // Upload/Paste image states
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageName, setUploadedImageName] = useState('');

  // Image preview URL
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Full-tab mode state
  const [isFullTab, setIsFullTab] = useState(true);
  const containerRef = useRef(null);
  const fullTabStateRefs = useRef({}).current;
  const uniqueWrapperClass = `ocrreader-wrapper-${useRef(Math.random().toString(36).substr(2, 9)).current}`;
  
  const fileInputRef = useRef(null);
  const currentBlobUrl = useRef(null);
  const dragCounter = useRef(0);

  // --- Load Tesseract.js on mount ---
  useEffect(() => {
    let mounted = true;
    
    const initTesseract = async () => {
      try {
        // Check if already loaded
        if (window.Tesseract) {
          console.log('[OCR] Tesseract.js already available');
          if (mounted) setTesseractLoaded(true);
          return;
        }
        
        console.log('[OCR] Loading Tesseract.js from local assets...');
        // Load Tesseract from local assets folder
        const result = await loadScript(dc, folderPath + '/assets/tesseract.min.js', {
          globalName: 'Tesseract',
          type: 'script'
        });
        
        if (window.Tesseract && mounted) {
          console.log('[OCR] Tesseract.js loaded successfully');
          setTesseractLoaded(true);
        } else if (!window.Tesseract) {
          throw new Error('Tesseract object not found after script load');
        }
      } catch (err) {
        console.error('[OCR] Failed to load Tesseract.js:', err);
        if (mounted) {
          setError(`Failed to load OCR library: ${err.message}`);
        }
      }
    };
    
    initTesseract();
    
    return () => {
      mounted = false;
    };
  }, []);

  // --- Load vault image files ---
  useEffect(() => {
    const allFiles = dc.app.vault.getFiles();
    const imageFiles = allFiles.filter(file => {
      const ext = file.extension.toLowerCase();
      return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'].includes(ext);
    });
    imageFiles.sort((a, b) => a.path.localeCompare(b.path));
    setVaultImageFiles(imageFiles);
    
    // Set default image - resolve resources path relative to folderPath
    const defaultImagePath = folderPath + '/assets/ocr_reader.webp';
    // Remove leading slash if present in file path mapping
    const cleanDefaultPath = defaultImagePath.replace(/^\//, '');
    const defaultImage = imageFiles.find(f => f.path.replace(/^\//, '') === cleanDefaultPath);
    
    if (defaultImage) {
      setSelectedVaultFilePath(defaultImage.path);
    } else if (imageFiles.length > 0 && !selectedVaultFilePath) {
      setSelectedVaultFilePath(imageFiles[0].path);
    }
  }, []);

  // --- Blob URL Cleanup ---
  useEffect(() => {
    return () => {
      if (currentBlobUrl.current) {
        URL.revokeObjectURL(currentBlobUrl.current);
        currentBlobUrl.current = null;
      }
    };
  }, [imagePreviewUrl]);

  // --- Handle Vault File Selection & Preview ---
  useEffect(() => {
    const updateVaultImage = async () => {
      if (selectedVaultFilePath && imageSource === 'vault') {
        const file = dc.app.vault.getAbstractFileByPath(selectedVaultFilePath);
        if (file && typeof file.extension === 'string') {
          try {
            const arrayBuffer = await dc.app.vault.readBinary(file);
            
            // Convert to base64 data URL (works better with Tesseract in Electron)
            const uint8Array = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < uint8Array.byteLength; i++) {
              binary += String.fromCharCode(uint8Array[i]);
            }
            const base64 = btoa(binary);
            const mimeType = file.extension === 'svg' ? 'image/svg+xml' : `image/${file.extension}`;
            const dataUrl = `data:${mimeType};base64,${base64}`;
            
            if (currentBlobUrl.current) URL.revokeObjectURL(currentBlobUrl.current);
            currentBlobUrl.current = null;
            setImagePreviewUrl(dataUrl);
          } catch (err) {
            console.error(`[OCR] Failed to generate preview:`, err);
            setImagePreviewUrl(null);
          }
        } else {
          setImagePreviewUrl(null);
        }
        // Clear upload states when switching to vault
        setUploadedImage(null);
        setUploadedImageName('');
        setOcrText("");
        setError(null);
      }
    };
    updateVaultImage();
  }, [selectedVaultFilePath, imageSource]);

  // --- Handle Image Upload/Paste ---
  useEffect(() => {
    if (uploadedImage && (imageSource === 'upload' || imageSource === 'paste')) {
      setImagePreviewUrl(uploadedImage);
      setOcrText("");
      setError(null);
    }
  }, [uploadedImage, imageSource]);

  // --- Full-tab mode effect ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isFullTab) {
      if (!container.parentNode) {
        setTimeout(() => setIsFullTab(true), 50);
        return;
      }
      const targetPaneContent = findNearestAncestorWithClass(container, 'workspace-leaf-content');
      if (!targetPaneContent) {
        console.error("[OCR] Full tab mode failed");
        setIsFullTab(false);
        return;
      }
      const contentWrapper = findDirectChildByClass(targetPaneContent, 'view-content') || targetPaneContent;
      
      fullTabStateRefs.originalParent = container.parentNode;
      fullTabStateRefs.placeholder = document.createElement('div');
      fullTabStateRefs.placeholder.style.display = 'none';
      container.parentNode.insertBefore(fullTabStateRefs.placeholder, container);
      
      const computedParentPosition = window.getComputedStyle(contentWrapper).position;
      fullTabStateRefs.parentPositionInfo = {
        element: contentWrapper,
        originalInlinePosition: contentWrapper.style.position
      };
      if (computedParentPosition === 'static') {
        contentWrapper.style.position = "relative";
      }
      
      contentWrapper.appendChild(container);
      Object.assign(container.style, {
        position: "absolute", top: "0px", left: "0px",
        width: "100%", height: "100%", zIndex: "9998",
        overflow: "auto"
      });
    }

    return () => {
      if (!fullTabStateRefs.originalParent) return;
      if (fullTabStateRefs.placeholder?.parentNode) {
        fullTabStateRefs.placeholder.parentNode.replaceChild(container, fullTabStateRefs.placeholder);
      } else {
        fullTabStateRefs.originalParent.appendChild(container);
      }
      if (fullTabStateRefs.parentPositionInfo?.element) {
        fullTabStateRefs.parentPositionInfo.element.style.position = fullTabStateRefs.parentPositionInfo.originalInlinePosition || '';
      }
      container.removeAttribute("style");
      Object.keys(fullTabStateRefs).forEach(key => fullTabStateRefs[key] = null);
    };
  }, [isFullTab]);

  // ============================================================================
  //  Event Handlers
  // ============================================================================

  const handleOcr = async () => {
    if (!tesseractLoaded) {
      setError("Tesseract.js library is not loaded yet. Please wait...");
      return;
    }

    if (!imagePreviewUrl) {
      setError("No image selected for OCR.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOcrText("");
    setProgress(0);

    try {
      const result = await window.Tesseract.recognize(
        imagePreviewUrl,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const progressPercent = Math.round(m.progress * 100);
              setProgress(progressPercent);
            }
          }
        }
      );
      
      const extractedText = result.data.text;
      
      if (extractedText && extractedText.trim().length > 0) {
        setOcrText(extractedText);
      } else {
        setOcrText("");
        setError("OCR completed, but no text was detected in the image.");
      }
    } catch (err) {
      console.error('[OCR] Processing failed:', err);
      setError(`OCR failed: ${err.message}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setUploadedImageName(file.name);
        setImageSource('upload');
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Please select a valid image file.");
    }
  };

  const handlePaste = (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        event.preventDefault();
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target.result);
          setUploadedImageName('Pasted Image');
          setImageSource('paste');
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    
    console.log('[OCR Drop] Drop triggered!');
    
    // Log files
    const files = event.dataTransfer?.files;
    console.log('[OCR Drop] Files count:', files?.length);
    if (files) {
      for (let i = 0; i < files.length; i++) {
        console.log(`[OCR Drop] File [${i}]:`, files[i].name, files[i].type, files[i].size);
      }
    }

    // Log items types
    const items = event.dataTransfer?.items;
    console.log('[OCR Drop] Items count:', items?.length);
    if (items) {
      for (let i = 0; i < items.length; i++) {
        console.log(`[OCR Drop] Item [${i}]:`, items[i].kind, items[i].type);
      }
    }

    // Log all data formats available
    const types = event.dataTransfer?.types;
    console.log('[OCR Drop] DataTransfer types:', types);
    if (types) {
      types.forEach(type => {
        try {
          const val = event.dataTransfer.getData(type);
          console.log(`[OCR Drop] DataTransfer type "${type}":`, val);
        } catch (e) {
          console.log(`[OCR Drop] DataTransfer type "${type}" error reading:`, e.message);
        }
      });
    }
    
    // 1. Handle external files (from Finder / File Explorer)
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target.result);
          setUploadedImageName(file.name);
          setImageSource('upload');
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please drop an image file');
      }
      return;
    }

    // 2. Handle internal Obsidian drag and drop (from file tree or notes)
    const textData = event.dataTransfer?.getData('text/plain');
    if (textData) {
      let cleanPath = textData.trim();
      console.log('[OCR Drop] Attempting linkpath resolution for:', cleanPath);

      // Handle obsidian:// open URI links
      if (cleanPath.startsWith('obsidian://open')) {
        try {
          const queryIdx = cleanPath.indexOf('?');
          if (queryIdx !== -1) {
            const urlParams = new URLSearchParams(cleanPath.substring(queryIdx));
            const filePathParam = urlParams.get('file');
            if (filePathParam) {
              cleanPath = decodeURIComponent(filePathParam);
              console.log('[OCR Drop] Extracted path from Obsidian URI:', cleanPath);
            }
          }
        } catch (uriError) {
          console.error('[OCR Drop] Failed parsing Obsidian URI:', uriError);
        }
      }
      
      // Strip markdown link brackets if present: [[file.png]]
      if (cleanPath.startsWith('[[') && cleanPath.endsWith(']]')) {
        cleanPath = cleanPath.slice(2, -2);
      }
      // Strip markdown link aliases: [[file.png|Alias]]
      if (cleanPath.includes('|')) {
        cleanPath = cleanPath.split('|')[0];
      }

      console.log('[OCR Drop] Cleaned path to find:', cleanPath);

      // Try to find the file in the vault
      const file = dc.app.metadataCache.getFirstLinkpathDest(cleanPath, '');
      console.log('[OCR Drop] Resolved vault file dest:', file ? file.path : 'NOT FOUND');
      if (file && typeof file.extension === 'string') {
        const ext = file.extension.toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
          setSelectedVaultFilePath(file.path);
          setImageSource('vault');
        } else {
          console.warn('[OCR Drop] Dropped file is not an image type:', ext);
        }
      }
    }
  };

  const copyToClipboard = () => {
    if (ocrText) {
      navigator.clipboard.writeText(ocrText);
      alert('Text copied to clipboard!');
    }
  };

  // ============================================================================
  //  Styles
  // ============================================================================

  const styles = {
    container: {
      height: '100%',
      width: '100%',
      padding: '24px',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
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
      color: '#ffffff',
      letterSpacing: '2px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    section: {
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(155, 135, 245, 0.2)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#ffffff',
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
      backgroundColor: 'rgba(155, 135, 245, 0.15)',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      justifyContent: 'center',
      border: '1px solid rgba(155, 135, 245, 0.3)'
    },
    buttonHover: {
      backgroundColor: 'rgba(155, 135, 245, 0.25)',
      borderColor: 'rgba(155, 135, 245, 0.5)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(155, 135, 245, 0.2)'
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
      color: '#ffffff',
      padding: '10px 16px',
      backgroundColor: '#0a0a0a',
      borderRadius: '8px',
      border: '1px solid rgba(155, 135, 245, 0.2)',
      transition: 'all 0.2s ease'
    },
    radioLabelActive: {
      backgroundColor: 'rgba(155, 135, 245, 0.15)',
      borderColor: 'rgba(155, 135, 245, 0.5)'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(155, 135, 245, 0.3)',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
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
      border: '2px solid rgba(155, 135, 245, 0.3)',
      borderRadius: '12px',
      backgroundColor: '#0a0a0a',
      boxShadow: '0 0 20px rgba(155, 135, 245, 0.1)'
    },
    dropZone: {
      padding: '60px 40px',
      border: '2px dashed rgba(155, 135, 245, 0.3)',
      borderRadius: '12px',
      textAlign: 'center',
      backgroundColor: '#0a0a0a',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    dropZoneActive: {
      borderColor: 'rgba(155, 135, 245, 0.6)',
      backgroundColor: 'rgba(155, 135, 245, 0.05)',
      transform: 'scale(1.02)'
    },
    dropZoneContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      color: '#ffffff'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(155, 135, 245, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '16px',
      border: '1px solid rgba(155, 135, 245, 0.2)'
    },
    progressFill: {
      height: '100%',
      backgroundColor: 'rgba(155, 135, 245, 0.8)',
      transition: 'width 0.3s ease',
      boxShadow: '0 0 10px rgba(155, 135, 245, 0.5)'
    },
    textArea: {
      width: '100%',
      minHeight: '250px',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid rgba(155, 135, 245, 0.3)',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
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
      backgroundColor: 'rgba(155, 135, 245, 0.1)',
      border: '1px solid rgba(155, 135, 245, 0.3)',
      color: '#ffffff',
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
      backgroundColor: 'rgba(10, 10, 10, 0.9)',
      border: '3px dashed rgba(155, 135, 245, 0.8)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: '#ffffff',
      pointerEvents: 'none'
    }
  };

  return (
    <div 
      ref={containerRef} 
      style={{ ...styles.container, position: 'relative' }} 
      className={uniqueWrapperClass}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div style={{
        ...styles.dragOverlay,
        opacity: isDragging ? 1 : 0,
        visibility: isDragging ? 'visible' : 'hidden',
        transition: 'opacity 0.2s ease, visibility 0.2s ease'
      }}>
        <dc.Icon icon="upload-cloud" style={{fontSize: '64px', color: 'rgba(155, 135, 245, 0.8)', marginBottom: '16px'}} />
        <h2 style={{fontSize: '24px', fontWeight: '300', letterSpacing: '1px', margin: '0 0 8px 0'}}>Drop Image Here</h2>
        <p style={{color: 'rgba(255, 255, 255, 0.5)', margin: 0}}>to extract text automatically</p>
      </div>
      <style>{`
        .${uniqueWrapperClass}:hover .exit-fulltab-icon,
        .${uniqueWrapperClass}:hover .enter-fulltab-icon { 
          opacity: 1; 
          transform: scale(1); 
        }
        .${uniqueWrapperClass} .exit-fulltab-icon,
        .${uniqueWrapperClass} .enter-fulltab-icon {
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Full Tab Toggle Icon */}
      {isFullTab ? (
        <span 
          style={{
            position: "absolute", top: "15px", right: "20px", 
            fontSize: "20px", color: "rgba(155, 135, 245, 0.6)", userSelect: "none",
            cursor: "pointer", zIndex: 10,
          }}
          className="exit-fulltab-icon"
          title="Exit Full Tab"
          onClick={(e) => { e.stopPropagation(); setIsFullTab(false); }}
        >
          <dc.Icon icon="minimize-2" />
        </span>
      ) : (
        <span 
          style={{
            position: "absolute", top: "15px", right: "20px",
            fontSize: "20px", color: "rgba(155, 135, 245, 0.6)", userSelect: "none",
            cursor: "pointer", zIndex: 10,
          }}
          className="enter-fulltab-icon"
          title="Expand to Full Tab"
          onClick={(e) => { e.stopPropagation(); setIsFullTab(true); }}
        >
          <dc.Icon icon="maximize-2" />
        </span>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <dc.Icon icon="scan-text" style={{fontSize: '28px', color: 'rgba(155, 135, 245, 0.8)'}} />
          OCR TEXT EXTRACTOR
        </h2>
      </div>

      {/* Tesseract Loading Status */}
      {!tesseractLoaded && !error && (
        <div style={styles.info}>
          <dc.Icon icon="loader" className="spin" style={{fontSize: '16px'}} />
          <span>Loading OCR library from CDN...</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          <dc.Icon icon="alert-triangle" style={{fontSize: '16px'}} />
          <span>{error}</span>
        </div>
      )}

      {/* Image Source Selection */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <dc.Icon icon="image" style={{color: 'rgba(155, 135, 245, 0.8)'}} />
          1. Select Image Source
        </h3>
        
        <div style={styles.radioGroup}>
          <label style={{
            ...styles.radioLabel,
            ...(imageSource === 'vault' ? styles.radioLabelActive : {})
          }}>
            <input 
              type="radio" 
              name="imageSource" 
              value="vault" 
              checked={imageSource === 'vault'}
              onChange={() => setImageSource('vault')}
            />
            <dc.Icon icon="folder-open" style={{fontSize: '16px', color: 'rgba(155, 135, 245, 0.8)'}} />
            <span>From Vault</span>
          </label>
          <label style={{
            ...styles.radioLabel,
            ...(imageSource === 'upload' ? styles.radioLabelActive : {})
          }}>
            <input 
              type="radio" 
              name="imageSource" 
              value="upload" 
              checked={imageSource === 'upload'}
              onChange={() => setImageSource('upload')}
            />
            <dc.Icon icon="upload" style={{fontSize: '16px', color: 'rgba(155, 135, 245, 0.8)'}} />
            <span>Upload Image</span>
          </label>
        </div>

        {imageSource === 'vault' && (
          <div style={{position: 'relative', width: '100%', marginTop: '8px', marginBottom: '16px'}}>
            <select 
              style={{
                width: '100%',
                height: '48px',
                padding: '0 40px 0 16px',
                margin: 0,
                borderRadius: '8px',
                border: '1px solid rgba(155, 135, 245, 0.3)',
                backgroundColor: '#1e1e1e',
                color: '#ffffff',
                fontSize: '15px',
                lineHeight: '48px',
                cursor: 'pointer',
                fontFamily: 'var(--font-interface)',
                fontWeight: '500',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                display: 'block'
              }}
              value={selectedVaultFilePath}
              onChange={(e) => setSelectedVaultFilePath(e.target.value)}
            >
              <option value="" style={{backgroundColor: '#1e1e1e', color: '#ffffff', padding: '12px'}}>
                Select an image from vault...
              </option>
              {vaultImageFiles.map(file => (
                <option key={file.path} value={file.path} style={{backgroundColor: '#1e1e1e', color: '#ffffff', padding: '12px'}}>
                  {file.path}
                </option>
              ))}
            </select>
            <div style={{
              position: 'absolute', 
              right: '16px', 
              top: '16px',
              fontSize: '16px',
              color: 'rgba(155, 135, 245, 0.8)',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              <dc.Icon icon="chevron-down" />
            </div>
          </div>
        )}

        {imageSource === 'upload' && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              style={{display: 'none'}}
            />
            
            <div
              style={{
                ...styles.dropZone,
                ...(isDragging ? styles.dropZoneActive : {})
              }}
              onClick={() => fileInputRef.current?.click()}
              onPaste={handlePaste}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              tabIndex={0}
            >
              {uploadedImage ? (
                <div style={styles.dropZoneContent}>
                  <dc.Icon icon="check-circle" style={{fontSize: '40px', color: 'rgba(155, 135, 245, 0.8)', marginBottom: '8px'}} />
                  <div style={{fontSize: '15px', fontWeight: '600', marginBottom: '6px', color: '#ffffff'}}>
                    {uploadedImageName}
                  </div>
                  <div style={{fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <dc.Icon icon="mouse-pointer-click" style={{fontSize: '14px'}} />
                    Click to change, or paste a new image
                  </div>
                </div>
              ) : (
                <div style={styles.dropZoneContent}>
                  <dc.Icon icon="upload-cloud" style={{fontSize: '48px', color: 'rgba(155, 135, 245, 0.4)', marginBottom: '12px'}} />
                  <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#ffffff'}}>
                    Click to upload or drag & drop
                  </div>
                  <div style={{fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <dc.Icon icon="clipboard" style={{fontSize: '14px'}} />
                    You can also paste an image (Ctrl/Cmd+V)
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Image Preview */}
      {imagePreviewUrl && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <dc.Icon icon="eye" style={{color: 'rgba(155, 135, 245, 0.8)'}} />
            2. Image Preview
          </h3>
          <img 
            src={imagePreviewUrl} 
            alt="Image to process" 
            style={styles.imagePreview}
          />
        </div>
      )}

      {/* OCR Button */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <dc.Icon icon="wand-2" style={{color: 'rgba(155, 135, 245, 0.8)'}} />
          3. Extract Text
        </h3>
        
        <button
          style={{
            ...styles.button,
            width: '100%',
            ...(isLoading || !tesseractLoaded || !imagePreviewUrl ? styles.buttonDisabled : {})
          }}
          onClick={handleOcr}
          disabled={isLoading || !tesseractLoaded || !imagePreviewUrl}
          onMouseEnter={(e) => {
            if (!isLoading && tesseractLoaded && imagePreviewUrl) {
              Object.assign(e.currentTarget.style, styles.buttonHover);
            }
          }}
          onMouseLeave={(e) => {
            Object.assign(e.currentTarget.style, {
              backgroundColor: 'rgba(155, 135, 245, 0.15)',
              borderColor: 'rgba(155, 135, 245, 0.3)',
              transform: 'translateY(0)',
              boxShadow: 'none'
            });
          }}
        >
          {isLoading ? (
            <>
              <dc.Icon icon="loader" className="spin" style={{fontSize: '16px'}} />
              Processing... {progress}%
            </>
          ) : (
            <>
              <dc.Icon icon="scan-text" style={{fontSize: '16px'}} />
              Extract Text from Image
            </>
          )}
        </button>

        {isLoading && (
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${progress}%`}} />
          </div>
        )}
      </div>

      {/* OCR Results */}
      {ocrText && (
        <div style={styles.section}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
            <h3 style={{...styles.sectionTitle, margin: 0}}>
              <dc.Icon icon="file-text" style={{color: 'rgba(155, 135, 245, 0.8)'}} />
              4. Extracted Text
            </h3>
            <button
              style={styles.button}
              onClick={copyToClipboard}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, {
                  backgroundColor: 'rgba(155, 135, 245, 0.15)',
                  borderColor: 'rgba(155, 135, 245, 0.3)',
                  transform: 'translateY(0)',
                  boxShadow: 'none'
                });
              }}
            >
              <dc.Icon icon="copy" style={{fontSize: '14px'}} />
              Copy to Clipboard
            </button>
          </div>
          
          <textarea
            style={styles.textArea}
            value={ocrText}
            readOnly
            placeholder="Extracted text will appear here..."
          />
        </div>
      )}
    </div>
  );
}

return { App };
