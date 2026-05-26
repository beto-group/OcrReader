---
author: beto.group
contributor: []
version: 2.0.6
id: ocr-reader-410
name: OCR Reader
description: A client-side OCR tool that extracts text from vault images, uploads, or clipboard content using Tesseract.js, featuring offline caching.
status: stable
complexity: intermediate
category:
  - utility
  - text-extraction
  - ocr
  - image-processing
compatibility:
  - Obsidian >=1.4.11
  - Datacore >=0.8.0
repository:
  - https://github.com/beto-group/OcrReader
missing: []
resources:
  - assets/ocrreader.clip.gif
  - assets/ocr_reader.webp
type: DatacoreComponent
target: Datacore
security:
  - Sandboxed
storage:
  - LocalState
  - LocalStorage
network: CDN Script Loading
runtime: PureJS
entry_point: OCR READER.md
logic: src/index.jsx
---

This file contains the machine-readable packaging manifest and indexing properties for this component.
