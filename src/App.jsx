// App.jsx
const currentFilePath = dc.useCurrentPath();
const folderPath = currentFilePath 
  ? currentFilePath.substring(0, currentFilePath.lastIndexOf("/")) 
  : "_RESOURCES/DATACORE/_DONE/OcrReader";

const { useState, useEffect, useRef } = dc;

const { loadScript } = await dc.require(folderPath + "/src/utils/loadScript.js");
const { findNearestAncestorWithClass, findDirectChildByClass } = await dc.require(folderPath + "/src/utils/domUtils.js");
const { getThemeStyles } = await dc.require(folderPath + "/src/utils/theme.js");
const { DropZone } = await dc.require(folderPath + "/src/components/DropZone.jsx");
const { heuristicConfidence } = await dc.require(folderPath + "/src/core/confidence.js");
const { initOcrBackend } = await dc.require(folderPath + "/src/core/ocrBackend.js");

const { OcrPipeline } = await initOcrBackend({ folderPath, dc, loadScript, heuristicConfidence });

function App() {
  // OCR process states
  const [ocrText, setOcrText] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [ocrBackendName, setOcrBackendName] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const pipelineRef = useRef(new OcrPipeline());

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
  const isCancelledRef = useRef(false);

  // Unmount cleanup
  useEffect(() => {
    isCancelledRef.current = false;
    return () => {
      isCancelledRef.current = true;
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
    
    const defaultImagePath = folderPath + '/assets/ocr_reader.webp';
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

  const handleOcr = async () => {
    if (!imagePreviewUrl) {
      setError("No image selected for OCR.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOcrText("");
    setOcrConfidence(0);
    setOcrBackendName("");
    setProgress(0);

    try {
      const pipeline = pipelineRef.current;
      const result = await pipeline.run(imagePreviewUrl, (prog) => {
        if (!isCancelledRef.current) {
          setProgress(prog);
        }
      });
      
      if (isCancelledRef.current) return;
      
      if (result.text && result.text.trim().length > 0) {
        setOcrText(result.text);
        setOcrConfidence(result.confidence);
        setOcrBackendName(result.backendUsed);
      } else {
        setOcrText("");
        setError("OCR completed, but no text was detected in the image.");
      }
    } catch (err) {
      console.error('[OCR] Processing failed:', err);
      if (!isCancelledRef.current) {
        setError(`OCR failed: ${err.message}`);
      }
    } finally {
      if (!isCancelledRef.current) {
        setIsLoading(false);
        setProgress(0);
      }
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
    
    const files = event.dataTransfer?.files;
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

    const textData = event.dataTransfer?.getData('text/plain');
    if (textData) {
      let cleanPath = textData.trim();
      if (cleanPath.startsWith('obsidian://open')) {
        try {
          const queryIdx = cleanPath.indexOf('?');
          if (queryIdx !== -1) {
            const urlParams = new URLSearchParams(cleanPath.substring(queryIdx));
            const filePathParam = urlParams.get('file');
            if (filePathParam) {
              cleanPath = decodeURIComponent(filePathParam);
            }
          }
        } catch (uriError) {
          console.error('[OCR Drop] Failed parsing Obsidian URI:', uriError);
        }
      }
      
      if (cleanPath.startsWith('[[') && cleanPath.endsWith(']]')) {
        cleanPath = cleanPath.slice(2, -2);
      }
      if (cleanPath.includes('|')) {
        cleanPath = cleanPath.split('|')[0];
      }

      const file = dc.app.metadataCache.getFirstLinkpathDest(cleanPath, '');
      if (file && typeof file.extension === 'string') {
        const ext = file.extension.toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
          setSelectedVaultFilePath(file.path);
          setImageSource('vault');
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

  const styles = getThemeStyles(isDragging, isLoading, !!ocrText);

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
      <div style={styles.dragOverlay}>
        <dc.Icon icon="upload-cloud" style={{fontSize: '64px', color: 'var(--interactive-accent)', marginBottom: '16px'}} />
        <h2 style={{fontSize: '24px', fontWeight: '300', letterSpacing: '1px', margin: '0 0 8px 0'}}>Drop Image Here</h2>
        <p style={{color: 'var(--text-muted)', margin: 0}}>to extract text automatically</p>
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

      {isFullTab ? (
        <span 
          style={{
            position: "absolute", top: "15px", right: "20px", 
            fontSize: "20px", color: "var(--text-muted)", userSelect: "none",
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
            fontSize: "20px", color: "var(--text-muted)", userSelect: "none",
            cursor: "pointer", zIndex: 10,
          }}
          className="enter-fulltab-icon"
          title="Expand to Full Tab"
          onClick={(e) => { e.stopPropagation(); setIsFullTab(true); }}
        >
          <dc.Icon icon="maximize-2" />
        </span>
      )}

      <div style={styles.header}>
        <h2 style={styles.title}>
          <dc.Icon icon="scan-text" style={{fontSize: '28px', color: 'var(--interactive-accent)'}} />
          OCR TEXT EXTRACTOR
        </h2>
      </div>

      {error && (
        <div style={styles.error}>
          <dc.Icon icon="alert-triangle" style={{fontSize: '16px'}} />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <dc.Icon icon="image" style={{color: 'var(--interactive-accent)'}} />
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
            <dc.Icon icon="folder-open" style={{fontSize: '16px', color: 'var(--interactive-accent)'}} />
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
            <dc.Icon icon="upload" style={{fontSize: '16px', color: 'var(--interactive-accent)'}} />
            <span>Upload Image</span>
          </label>
        </div>

        {imageSource === 'vault' && (
          <div style={{position: 'relative', width: '100%', marginTop: '8px', marginBottom: '16px'}}>
            <select 
              style={{...styles.select, paddingRight: '40px', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none'}}
              value={selectedVaultFilePath}
              onChange={(e) => setSelectedVaultFilePath(e.target.value)}
            >
              <option value="" style={{backgroundColor: 'var(--background-modifier-form-field)', color: 'var(--text-normal)', padding: '12px'}}>
                Select an image from vault...
              </option>
              {vaultImageFiles.map(file => (
                <option key={file.path} value={file.path} style={{backgroundColor: 'var(--background-modifier-form-field)', color: 'var(--text-normal)', padding: '12px'}}>
                  {file.path}
                </option>
              ))}
            </select>
            <div style={{
              position: 'absolute', right: '16px', top: '16px', fontSize: '16px', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 10
            }}>
              <dc.Icon icon="chevron-down" />
            </div>
          </div>
        )}

        {imageSource === 'upload' && (
          <DropZone 
            dc={dc}
            styles={styles}
            isDragging={isDragging}
            uploadedImage={uploadedImage}
            uploadedImageName={uploadedImageName}
            fileInputRef={fileInputRef}
            handleFileInputChange={handleFileInputChange}
            handlePaste={handlePaste}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
          />
        )}
      </div>

      {imagePreviewUrl && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <dc.Icon icon="eye" style={{color: 'var(--interactive-accent)'}} />
            2. Image Preview
          </h3>
          <img 
            src={imagePreviewUrl} 
            alt="Image to process" 
            style={styles.imagePreview}
          />
        </div>
      )}

      <div style={styles.section}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h3 style={{...styles.sectionTitle, margin: 0}}>
            <dc.Icon icon="wand-2" style={{color: 'var(--interactive-accent)'}} />
            3. Extract Text
          </h3>
          {ocrText && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '6px 12px', borderRadius: '20px', 
              backgroundColor: ocrConfidence >= 0.6 ? 'rgba(0,200,0,0.1)' : 'rgba(255,165,0,0.1)',
              color: ocrConfidence >= 0.6 ? '#00cc00' : 'orange',
              fontSize: '12px', fontWeight: 'bold'
            }}>
              <dc.Icon icon={ocrConfidence >= 0.6 ? "check-circle" : "alert-circle"} style={{fontSize: '14px'}} />
              Confidence: {(ocrConfidence * 100).toFixed(1)}% ({ocrBackendName})
            </div>
          )}
        </div>
        
        <button
          style={{
            ...styles.button,
            width: '100%',
            ...(isLoading || !imagePreviewUrl ? styles.buttonDisabled : {})
          }}
          onClick={handleOcr}
          disabled={isLoading || !imagePreviewUrl}
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

      {ocrText && (
        <div style={styles.section}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
            <h3 style={{...styles.sectionTitle, margin: 0}}>
              <dc.Icon icon="file-text" style={{color: 'var(--interactive-accent)'}} />
              4. Extracted Text
            </h3>
            <button style={styles.button} onClick={copyToClipboard}>
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
