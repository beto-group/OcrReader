
```datacorejsx
const activeFile = dc.resolvePath("OCR READER") || "_RESOURCES/DATACORE/_DONE/OcrReader/OCR READER";
const folderPath = activeFile.substring(0, activeFile.lastIndexOf('/'));
const { View } = await dc.require(folderPath + "/src/index.jsx");
return await View({ folderPath, dc });
```
