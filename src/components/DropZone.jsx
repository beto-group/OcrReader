// DropZone.jsx
function DropZone({ 
  dc, 
  styles, 
  isDragging, 
  uploadedImage, 
  uploadedImageName, 
  fileInputRef, 
  handleFileInputChange, 
  handlePaste, 
  handleDragOver, 
  handleDragLeave, 
  handleDrop 
}) {
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{display: 'none'}}
      />
      
      <div
        style={styles.dropZone}
        onClick={() => fileInputRef.current?.click()}
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
      >
        {uploadedImage ? (
          <div style={styles.dropZoneContent}>
            <dc.Icon icon="check-circle" style={{fontSize: '40px', color: 'var(--interactive-accent)', marginBottom: '8px'}} />
            <div style={{fontSize: '15px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-normal)'}}>
              {uploadedImageName}
            </div>
            <div style={{fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px'}}>
              <dc.Icon icon="mouse-pointer-click" style={{fontSize: '14px'}} />
              Click to change, or paste a new image
            </div>
          </div>
        ) : (
          <div style={styles.dropZoneContent}>
            <dc.Icon icon="upload-cloud" style={{fontSize: '48px', color: 'var(--text-muted)', marginBottom: '12px'}} />
            <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-normal)'}}>
              Click to upload or drag & drop
            </div>
            <div style={{fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <dc.Icon icon="clipboard" style={{fontSize: '14px'}} />
              You can also paste an image (Ctrl/Cmd+V)
            </div>
          </div>
        )}
      </div>
    </>
  );
}

return { DropZone };
