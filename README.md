
<div align="center">
  <a name="readme-top"></a>
  <img src="https://raw.githubusercontent.com/beto-group/beto.assets/main/BETO.logo.animated.svg?raw=true" alt="LOGO" width="160">
  <h1 align="center">OCR READER</h1>
  <h3 align="center"> The Client-Side OCR Tool for Obsidian </h3>
</div>

<div align="center">
  <!-- TOP PURPLE LINKS -->
  <a href="https://beto.group"><img src="https://img.shields.io/badge/WEBSITE-7A46F1?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI%2BPHBhdGggZD0iTTE4IDEzdjZhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJWOGEyIDIgMCAwIDEgMi0yaGYiLz48cG9seWxpbmUgcG9pbnRzPSIxNSAzIDIxIDMgMjEgOSIvPjxsaW5lIHgxPSIxMCIgeDI9IjIxIiB5MT0iMTQiIHkyPSIzIi8%2BPC9zdmc+" alt="WEBSITE"></a>
  <a href="https://discord.com/invite/6rDp4q4Y2B"><img src="https://img.shields.io/badge/DISCORD-7A46F1?style=for-the-badge&logo=discord&logoColor=white" alt="JOIN OUR DISCORD"></a>
  <a href="https://github.com/sponsors/beto-group"><img src="https://img.shields.io/badge/Sponsor-7A46F1?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="SUPPORT US ON GITHUB"></a>
  <br/>
  <!-- BOTTOM GOLD TAXONOMY -->
  <img src="https://img.shields.io/badge/TARGET-DATACORE-000?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNGRkUxNjUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48ZWxsaXBzZSBjeD0iMTIiIGN5PSI1IiByeD0iOSIgcnk9IjMiLz48cGF0aCBkPSJNIDMgNXYxNGE5IDMgMCAwIDAgMTggMHYtMTQiLz48cGF0aCBkPSJNIDMgMTJhOSAzIDAgMCAwIDE4IDAiLz48L3N2Zz4%3D" alt="TARGET">
  <img src="https://img.shields.io/badge/SECURITY-SANDBOXED-000?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNGRkUxNjUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgMjJzOC00IDgtMTBWNWwtOC0zLTggM3Y3YzAgNiA4IDEwIDggMTB6Ii8%2BPC9zdmc+" alt="SECURITY">
  <img src="https://img.shields.io/badge/RUNTIME-PUREJS-000?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNGRkUxNjUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTUgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDAgMCAwIDAgMi0yVjdaIi8%2BPHBhdGggZD0iTTE0IDJ2NGEyIDIgMCAwIDAgMiAyaDQiLz48cGF0aCBkPSJNMTAgOUg4Ii8%2BPHBhdGggZD0iTTE2IDE3SDgiLz48L3N2Zz4%3D" alt="RUNTIME">
  <hr>
</div>

<img src="assets/ocrreader.clip.gif" alt="OCR Reader Walkthrough" width="100%">

<div align="center">
  <p>
    <i> A client-side Optical Character Recognition (OCR) tool that extracts text from vault images, uploads, or clipboard content using Tesseract.js, featuring offline caching. </i>
  </p>
  <hr style="width:30%;">
</div>

Welcome to **OCR Reader**, the client-side text extraction utility for Obsidian. By leveraging the power of client-side Tesseract.js libraries, it extracts printable text from images, clipboard captures, and local vault attachments. Heuristic engine scoring validates extracted content confidence automatically, keeping all operations fully sandbox-secure and offline.

---

## Quick Start

To start trying OCR Reader today:
1. **Download the Repository**: Clone or download this repository directly into any folder inside your Obsidian vault.
2. **Install Datacore**: Ensure you have the **Datacore** plugin installed and enabled in Obsidian.
3. **Open the Entry Note**: Open the **`OCR READER.md`** note inside Obsidian to launch the component!

---

## Features

### Multi-Source Extraction
*   **Drag & Drop Loading**: Process local desktop images instantly by dragging them into the active canvas.
*   **Clipboard Buffer Sync**: Capture screen snippets and paste them directly with standard system paste events.
*   **Vault Image Explorer**: Index and search active vault media attachments for quick selection and execution.

### Heuristic Confidence Tuning
*   **Quality Metrics**: Custom word length validation, stop word checking, and character ratio heuristics evaluate transcription quality.
*   **Interactive Panel View**: Read detailed logs of extraction metrics alongside raw parsed text output.
*   **Performance Metrics**: Track processing time, characters detected, and raw word metrics on every job.

### Offline Sandboxed Execution
*   **Dynamic Script Loading**: Safely boots Tesseract.js from local asset caches or external fallbacks.
*   **Offline Script Caching**: Saves dynamic scripts to a local cache to run securely offline.
*   **Zero External Telemetry**: Runs client-side inside a sandboxed environment, keeping private notes and images completely offline.

---

## Directory Index & Components

The package exposes the following compiled files:

| File | Description |
| :--- | :--- |
| **[OCR READER.md](OCR%20READER.md)** | The main loader query designed to be opened in any Obsidian workspace tab. |
| **[_RESOURCES/DATACORE/_DONE/OcrReader/src/index.jsx](_RESOURCES/DATACORE/_DONE/OcrReader/src/index.jsx)** | Premium React layout dashboard displaying the interactive OCR extractor. |
| **[_RESOURCES/DATACORE/_DONE/OcrReader/METADATA.md](_RESOURCES/DATACORE/_DONE/OcrReader/METADATA.md)** | Packaging manifest outlining taxonomy and asset locations. |
| **[_RESOURCES/DATACORE/_DONE/OcrReader/README.md](_RESOURCES/DATACORE/_DONE/OcrReader/README.md)** | Comprehensive premium user documentation. |
| **[assets/ocr_reader.webp](assets/ocr_reader.webp)** | High-fidelity static preview image of the component. |
| **[assets/ocrreader.clip.gif](assets/ocrreader.clip.gif)** | Lanczos-compressed walkthrough loop walkthrough GIF. |

---

## Previews

| Card Layout | Interactive OCR Reader |
| :---: | :---: |
| ![Preview 1](assets/ocr_reader.webp) | ![Walkthrough GIF](assets/ocrreader.clip.gif) |

---

## Contributors
- beto.group
