// // src/App.jsx
// import { useState, useEffect } from "react";
// import Cropper from "./components/Cropper";
// import { calculateDimensions, rotateImageSrc, flipImageSrc } from "./utils";
// import "./App.css";

// function App() {
//   const [image, setImage] = useState(null);

//   const [unit, setUnit] = useState("px");
//   const [width, setWidth] = useState(500);
//   const [height, setHeight] = useState(500);
//   const [dpi, setDpi] = useState(96);

//   const [format, setFormat] = useState("image/jpeg");
//   const [quality, setQuality] = useState(90);
//   const [bgChoice, setBgChoice] = useState("#ffffff");
//   const [customBg, setCustomBg] = useState("#ff0000");

//   const [uploadError, setUploadError] = useState("");
//   const [infoMessage, setInfoMessage] = useState("");
//   const [originalFile, setOriginalFile] = useState("");

//   // Enforce transparency rules visually
//   useEffect(() => {
//     if (format == "image/jpeg" && bgChoice === "transparent") {
//       setBgChoice("#ffffff");
//       setInfoMessage(
//         "Transparent background requires PNG format. Switched to White.",
//       );
//       setTimeout(() => setInfoMessage(""), 4500);
//     }
//   }, [format, bgChoice]);

//   // --- REPLACE your handleImageUpload with this ---
//   const handleImageUpload = (e) => {
//     setUploadError("");
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       setUploadError("Please upload a valid image file (JPG, PNG, WebP).");
//       return;
//     }
//     setOriginalFile(file.name);

//     const reader = new FileReader();
//     reader.onload = () => {
//       const img = new Image();
//       img.onload = () => {
//         // Automatically calculate correct input numbers based on current selected unit
//         let newW = img.naturalWidth;
//         let newH = img.naturalHeight;

//         if (unit === "cm") {
//           newW = Number(((newW * 2.54) / dpi).toFixed(2));
//           newH = Number(((newH * 2.54) / dpi).toFixed(2));
//         } else if (unit === "in") {
//           newW = Number((newW / dpi).toFixed(2));
//           newH = Number((newH / dpi).toFixed(2));
//         }

//         setWidth(newW);
//         setHeight(newH);
//         setImage(reader.result);
//       };
//       img.src = reader.result;
//     };
//     reader.onerror = () => setUploadError("Failed to read file.");
//     reader.readAsDataURL(file);
//     e.target.value = null; // Fixes "no file chosen" bug
//   };

//   // --- ADD these dynamic handlers ---
//   const handleUnitChange = (e) => {
//     const newUnit = e.target.value;
//     let pxW = Number(width) || 1;
//     let pxH = Number(height) || 1;

//     // 1. Convert current unit to Raw Pixels
//     if (unit === "cm") {
//       pxW = (width * dpi) / 2.54;
//       pxH = (height * dpi) / 2.54;
//     } else if (unit === "in") {
//       pxW = width * dpi;
//       pxH = height * dpi;
//     }

//     // 2. Convert Raw Pixels to the New Unit
//     if (newUnit === "cm") {
//       setWidth(Number(((pxW * 2.54) / dpi).toFixed(2)));
//       setHeight(Number(((pxH * 2.54) / dpi).toFixed(2)));
//     } else if (newUnit === "in") {
//       setWidth(Number((pxW / dpi).toFixed(2)));
//       setHeight(Number((pxH / dpi).toFixed(2)));
//     } else {
//       setWidth(Math.round(pxW));
//       setHeight(Math.round(pxH));
//     }

//     setUnit(newUnit);
//   };

//   const handleRotate = async () => {
//     if (!image) return;
//     const rotated = await rotateImageSrc(image, 90);
//     setImage(rotated);
//     // Swap the width and height inputs in the UI dynamically!
//     const tempW = width;
//     setWidth(height);
//     setHeight(tempW);
//   };

//   const handleFlip = async () => {
//     if (!image) return;
//     const flipped = await flipImageSrc(image);
//     setImage(flipped);
//   };

//   const { targetWidth, targetHeight } = calculateDimensions(
//     width,
//     height,
//     unit,
//     dpi,
//   );
//   const isFreeform = unit === "freeform";
//   const finalBgColor = bgChoice === "custom" ? customBg : bgChoice;
//   const isPhysicalUnit = unit === "cm" || unit === "in";

//   return (
//     <div className="app-container unselectable">
//       <h2>Advanced Image Cropper</h2>

//       {!image ? (
//         // CLEAN EMPTY STATE (Only visible before upload)
//         <div className="empty-state">
//           <div className="upload-box">
//             <h3>Upload an Image to Start</h3>
//             <p>Supports JPG, PNG, and WebP</p>
//             <input type="file" accept="image/*" onChange={handleImageUpload} />
//             {uploadError && <div className="error-message">{uploadError}</div>}
//           </div>
//         </div>
//       ) : (
//         // WORKSPACE (Visible only after image upload)
//         <>
//           <div className="settings-panel">
//             <div className="re-upload">
//               <label
//                 className="primary-btn"
//                 style={{
//                   display: "inline-block",
//                   cursor: "pointer",
//                   fontSize: "0.9rem",
//                   padding: "8px 16px",
//                 }}
//               >
//                 Change Image
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   style={{ display: "none" }}
//                 />
//               </label>
//              <span className="file-name-display" title={originalFile}>
//                 <strong>File:</strong> {originalFile || "None"}
//               </span>
//             </div>

//             <div className="dimensions">
//               {!isFreeform && (
//                 <>
//                   <input
//                     type="number"
//                     value={width}
//                     onChange={(e) => setWidth(e.target.value)}
//                     placeholder="W"
//                     min="1"
//                   />
//                   <input
//                     type="number"
//                     value={height}
//                     onChange={(e) => setHeight(e.target.value)}
//                     placeholder="H"
//                     min="1"
//                   />
//                 </>
//               )}

//               <select value={unit} onChange={(e) => setUnit(e.target.value)}>
//                 <option value="px">Pixels (px)</option>
//                 <option value="cm">Centimeters (cm)</option>
//                 <option value="in">Inches (in)</option>
//                 <option value="ratio">Ratio (Base 800px)</option>
//                 <option value="freeform">Freeform (Drag to Resize)</option>
//               </select>

//               {isPhysicalUnit && (
//                 <div className="setting-group" title="DPI sets print density.">
//                   <label>DPI:</label>
//                   <input
//                     type="number"
//                     value={dpi}
//                     onChange={(e) => setDpi(e.target.value)}
//                     min="72"
//                     style={{ width: "70px" }}
//                   />
//                 </div>
//               )}
//             </div>

//             <div className="export-settings">
//               <div className="setting-group">
//                 <label>Format:</label>
//                 <select
//                   value={format}
//                   onChange={(e) => setFormat(e.target.value)}
//                 >
//                   <option value="image/jpeg">JPEG</option>
//                   <option value="image/png">PNG</option>
//                   <option value="image/webp">WebP</option>
//                 </select>
//               </div>

//               <div className="setting-group">
//                 <label>Background:</label>
//                 <select
//                   value={bgChoice}
//                   onChange={(e) => setBgChoice(e.target.value)}
//                 >
//                   <option value="#ffffff">White</option>
//                   <option value="#000000">Black</option>
//                   {/* Option is visible but unselectable if not PNG */}
//                   <option value="transparent" disabled={format == "image/jpeg"}>
//                     Transparent (PNG, WebP)
//                   </option>
//                   <option value="custom">Custom Color</option>
//                 </select>
//                 {bgChoice === "custom" && (
//                   <div
//                     className="color-picker-wrapper"
//                     title="Click outside to close"
//                   >
//                     <input
//                       type="color"
//                       value={customBg}
//                       onChange={(e) => setCustomBg(e.target.value)}
//                     />
//                     <small>Native Picker</small>
//                   </div>
//                 )}
//               </div>

//               {format === "image/png" ? (
//                 <div className="info-text">PNG is lossless (Quality fixed)</div>
//               ) : (
//                 <div className="setting-group">
//                   <label>Quality ({quality}%):</label>
//                   <input
//                     type="range"
//                     min="1"
//                     max="100"
//                     value={quality}
//                     onChange={(e) => setQuality(Number(e.target.value))}
//                   />
//                 </div>
//               )}
//             </div>

//             {infoMessage && <div className="info-toast">{infoMessage}</div>}
//           </div>

//           <Cropper
//             imageSrc={image}
//             initialTargetWidth={targetWidth}
//             initialTargetHeight={targetHeight}
//             format={format}
//             quality={quality / 100}
//             bgColor={finalBgColor}
//             isFreeform={isFreeform}
//             onRotate={handleRotate} // <--- ADD THIS
//             onFlip={handleFlip}
//           />
//         </>
//       )}
//     </div>
//   );
// }

// export default App;

// src/App.jsx
import { useState, useEffect } from "react";
import Cropper from "./components/Cropper";
import { calculateDimensions, rotateImageSrc, flipImageSrc } from "./utils";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [originalName, setOriginalName] = useState("");
  const [originalSizeKb, setOriginalSizeKb] = useState(0);
  const [estFileSize, setEstFileSize] = useState(0);

  const [unit, setUnit] = useState("px");
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(500);
  const [dpi, setDpi] = useState(96);

  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [bgChoice, setBgChoice] = useState("#ffffff");
  const [customBg, setCustomBg] = useState("#ff0000");

  const [uploadError, setUploadError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (format === "image/jpeg" && bgChoice === "transparent") {
      setBgChoice("#ffffff");
      setInfoMessage(
        "Transparent background requires PNG format. Switched to White.",
      );
      setTimeout(() => setInfoMessage(""), 4500);
    }
  }, [format, bgChoice]);

  const handleImageUpload = (e) => {
    setUploadError("");
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    setOriginalName(file.name);
    setOriginalSizeKb((file.size / 1024).toFixed(2));

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let newW = img.naturalWidth;
        let newH = img.naturalHeight;

        if (unit === "cm") {
          newW = Number(((newW * 2.54) / dpi).toFixed(2));
          newH = Number(((newH * 2.54) / dpi).toFixed(2));
        } else if (unit === "in") {
          newW = Number((newW / dpi).toFixed(2));
          newH = Number((newH / dpi).toFixed(2));
        }

        setWidth(newW);
        setHeight(newH);
        setImage(reader.result);
      };
      img.src = reader.result;
    };
    reader.onerror = () => setUploadError("Failed to read file.");
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    let pxW = Number(width) || 1;
    let pxH = Number(height) || 1;

    if (unit === "cm") {
      pxW = (width * dpi) / 2.54;
      pxH = (height * dpi) / 2.54;
    } else if (unit === "in") {
      pxW = width * dpi;
      pxH = height * dpi;
    }

    if (newUnit === "cm") {
      setWidth(Number(((pxW * 2.54) / dpi).toFixed(2)));
      setHeight(Number(((pxH * 2.54) / dpi).toFixed(2)));
    } else if (newUnit === "in") {
      setWidth(Number((pxW / dpi).toFixed(2)));
      setHeight(Number((pxH / dpi).toFixed(2)));
    } else {
      setWidth(Math.round(pxW));
      setHeight(Math.round(pxH));
    }

    setUnit(newUnit);
  };

  const handleRotate = async () => {
    if (!image) return;
    const rotated = await rotateImageSrc(image, 90);
    setImage(rotated);
    const tempW = width;
    setWidth(height);
    setHeight(tempW);
  };

  const handleFlip = async () => {
    if (!image) return;
    const flipped = await flipImageSrc(image);
    setImage(flipped);
  };

  const { targetWidth, targetHeight } = calculateDimensions(
    width,
    height,
    unit,
    dpi,
  );
  const isFreeform = unit === "freeform";
  const finalBgColor = bgChoice === "custom" ? customBg : bgChoice;
  const isPhysicalUnit = unit === "cm" || unit === "in";

  return (
    <div className="app-container unselectable">
      <h2>Advanced Image Cropper</h2>

      {!image ? (
        <div className="empty-state">
          <div className="upload-box">
            <h3>Upload an Image to Start</h3>
            <p>Supports JPG, PNG, and WebP</p>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {uploadError && <div className="error-message">{uploadError}</div>}
          </div>
        </div>
      ) : (
        <>
          <div className="settings-panel">
            <div className="re-upload">
              <span className="file-name-display" title={originalName}>
                <strong>Editing:</strong>{" "}
                {originalName}
                {/* {originalName.length > 20
                  ? originalName.substring(0, 17) + "..."
                  : originalName} */}
              </span>
              <label className="primary-btn sm-btn">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div className="dimensions">
              {!isFreeform && (
                <div className="setting-group width-height-inputs">
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="W"
                    min="1"
                  />
                  <span>x</span>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="H"
                    min="1"
                  />
                </div>
              )}

              <select
                className="unit-select"
                value={unit}
                onChange={handleUnitChange}
              >
                <option value="px">Pixels (px)</option>
                <option value="cm">Centimeters (cm)</option>
                {/* <option value="in">Inches (in)</option> */}
                <option value="ratio">Ratio (Base 800px)</option>
                {/* <option value="freeform">Freeform</option> */}
              </select>

              {isPhysicalUnit && (
                <div className="setting-group" title="DPI sets print density.">
                  <label>DPI:</label>
                  <input
                    type="number"
                    value={dpi}
                    onChange={(e) => setDpi(e.target.value)}
                    min="72"
                    style={{ width: "70px" }}
                  />
                </div>
              )}
            </div>

            <div className="export-settings">
              <div className="setting-group">
                <label>Format:</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Background:</label>
                <select
                  value={bgChoice}
                  onChange={(e) => setBgChoice(e.target.value)}
                >
                  <option value="#ffffff">White</option>
                  <option value="#000000">Black</option>
                  <option
                    value="transparent"
                    disabled={format === "image/jpeg"}
                  >
                    Transparent
                  </option>
                  <option value="custom">Custom Color</option>
                </select>
                {bgChoice === "custom" && (
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={customBg}
                      onChange={(e) => setCustomBg(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {format === "image/png" ? (
                <div className="info-text">PNG is lossless</div>
              ) : (
                <div className="setting-group">
                  <label>Quality ({quality}%):</label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                  />
                  <strong style={{ color: '#007bff' }}>~{estFileSize} KB</strong>
                </div>
              )}
            </div>

            {infoMessage && <div className="info-toast">{infoMessage}</div>}
          </div>

          <Cropper
            imageSrc={image}
            initialTargetWidth={targetWidth}
            initialTargetHeight={targetHeight}
            format={format}
            quality={quality / 100}
            bgColor={finalBgColor}
            isFreeform={isFreeform}
            onRotate={handleRotate}
            onFlip={handleFlip}
            originalSizeKb={originalSizeKb}
            onSizeEstimate={setEstFileSize}
          />
        </>
      )}
    </div>
  );
}

export default App;
