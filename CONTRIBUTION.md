# 🛠️ Contributing to OCR Reader

Welcome! This document outlines the developer standards, code architecture, and hot-reload guidelines for maintaining the **OCR Reader** component.

---

## 🏛️ Core Architecture Pillars

1.  **Full-Pane DOM Reparenting**:
    *   The view targets the nearest `.workspace-leaf-content` ancestor and replaces standard Markdown leaves with a full-pane portal overlay.
    *   Dynamic lifecycle hooks inside `src/App.jsx` manage mounting, positioning offsets, and cleanups edge-to-edge.
2.  **Anti-Bleed Style Scoping**:
    *   All component styles are declared inside scoped Javascript design token sheets and bound to randomized, unique wrapper classes (e.g. `ocrreader-wrapper-[hash]`) to prevent layout leaks into the Obsidian UI.
3.  **Local Dynamic Script Caching**:
    *   To maintain vault portability and offline safety, external dependencies (like Tesseract.js) are loaded through the `loadScript.js` utility, which downloads and saves script assets locally to `.datacore/script_cache`.
4.  **Zero-Emoji UI Policy**:
    *   Strictly avoid using standard emojis in UI elements (buttons, selects, etc.). Standard Lucide vector symbols are imported via `<dc.Icon>` instead.

---

## 🚀 Development & Hot Module Replacement (HMR)

*   **Watch Daemon**: The entry bootstrapper `src/index.jsx` sets up an HMR watch loop looking for updates to `data/mcp_commands.json`.
*   **Triggering a Reload**: During development, update the files under `src/`. Then write a reload payload to force Obsidian's view compiler to reload the module cache:
    ```json
    {
      "action": "reload",
      "timestamp": 1234567890,
      "executed": false
    }
    ```
