// ocrBackend.js
async function initOcrBackend({ folderPath, dc, loadScript, heuristicConfidence }) {
  
  class OcrResult {
    constructor(text, confidence, backendUsed) {
      this.text = text;
      this.confidence = confidence;
      this.backendUsed = backendUsed;
    }
  }

  class OcrBackendBase {
    constructor(name) {
      this.name = name;
    }
    
    async extract(imageUrl, onProgress) {
      throw new Error("extract() must be implemented by subclass");
    }
  }

  class TesseractBackend extends OcrBackendBase {
    constructor() {
      super("surya-equivalent (tesseract)");
      this.isLoaded = false;
    }

    async load() {
      if (this.isLoaded || window.Tesseract) {
        this.isLoaded = true;
        return;
      }
      console.log('[OCR] Loading Tesseract.js from local assets...');
      await loadScript(dc, folderPath + '/assets/tesseract.min.js', {
        globalName: 'Tesseract',
        type: 'script'
      });
      if (!window.Tesseract) {
        throw new Error('Tesseract object not found after script load');
      }
      this.isLoaded = true;
    }

    async extract(imageUrl, onProgress) {
      await this.load();
      const result = await window.Tesseract.recognize(
        imageUrl,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text' && onProgress) {
              const progressPercent = Math.round(m.progress * 100);
              onProgress(progressPercent);
            }
          }
        }
      );
      
      const extractedText = result.data.text || "";
      const confidence = heuristicConfidence(extractedText);
      return new OcrResult(extractedText, confidence, this.name);
    }
  }

  class OcrPipeline {
    constructor() {
      this.backends = [
        new TesseractBackend()
        // If PDF text-layer extraction were added, it would go here as the first fast backend
      ];
    }

    async run(imageUrl, onProgress) {
      // Runs through the fallback chain until acceptable confidence is reached
      let bestResult = null;
      for (const backend of this.backends) {
        try {
          const result = await backend.extract(imageUrl, onProgress);
          if (result.text && result.text.trim()) {
            if (result.confidence >= 0.6) {
              return result; // Acceptable quality
            }
            // Keep track of the best result in case all fail the threshold
            if (!bestResult || result.confidence > bestResult.confidence) {
              bestResult = result;
            }
          }
        } catch (err) {
          console.error(`[OCR] Backend ${backend.name} failed:`, err);
        }
      }
      
      if (bestResult) {
        return bestResult; // Fallback to whatever gave the best score
      }
      
      return new OcrResult("", 0.0, "none");
    }
  }

  return { OcrResult, OcrBackendBase, TesseractBackend, OcrPipeline };
}

return { initOcrBackend };
