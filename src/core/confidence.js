// confidence.js
// Ported from Epstein-Pipeline heuristic confidence scoring

function heuristicConfidence(text) {
  if (!text || !text.trim()) {
    return 0.0;
  }

  // 1. Printable character ratio
  const totalChars = text.length;
  let printableCount = 0;
  for (let i = 0; i < totalChars; i++) {
    const code = text.charCodeAt(i);
    // Rough equivalent of Python's string.printable: ASCII 32-126 plus common whitespace
    if ((code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13) {
      printableCount++;
    }
  }
  const printableRatio = totalChars ? (printableCount / totalChars) : 0.0;

  // 2. Average word length
  const words = text.trim().split(/\s+/);
  if (!words || words.length === 0) {
    return 0.0;
  }
  
  let totalWordLen = 0;
  for (const w of words) {
    totalWordLen += w.length;
  }
  const avgWordLen = totalWordLen / words.length;
  
  let wordLenScore = 1.0;
  if (avgWordLen < 2.0) {
    wordLenScore = avgWordLen / 2.0;
  } else if (avgWordLen > 12.0) {
    wordLenScore = Math.max(0.3, 1.0 - (avgWordLen - 12.0) / 20.0);
  }

  // 3. Stop-word presence (check that text is real English)
  const stopWords = new Set(["the", "and", "of", "to", "in", "a", "is", "that", "for", "it"]);
  const uniqueLowerWords = new Set(
    words.map(w => w.toLowerCase().replace(/[^\w]/g, ""))
  );
  
  let stopHits = 0;
  for (const sw of stopWords) {
    if (uniqueLowerWords.has(sw)) {
      stopHits++;
    }
  }
  
  const stopScore = Math.min(1.0, stopHits / 3.0); // 3+ unique stop words = max score

  // Weighted combination
  const confidence = (0.40 * printableRatio) + (0.30 * wordLenScore) + (0.30 * stopScore);
  
  return parseFloat(Math.min(1.0, Math.max(0.0, confidence)).toFixed(4));
}

return { heuristicConfidence };
