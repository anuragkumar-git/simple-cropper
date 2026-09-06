// src/components/Cropper.jsx
import { useState, useRef, useEffect } from "react";
import { getCanvasBlob, downloadBlob } from "../utils";

export default function Cropper({
  imageSrc,
  initialTargetWidth,
  initialTargetHeight,
  format,
  quality,
  bgColor,
  isFreeform,
  onRotate,
  onFlip,
}) {
  const [fitMode, setFitMode] = useState("cover");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [displayScale, setDisplayScale] = useState(1);
  const [fileSizeKb, setFileSizeKb] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState(false);
  const [fileName, setFileName] = useState("my-cropped-image");
  const [error, setError] = useState(null);

  const [boxDimensions, setBoxDimensions] = useState({
    w: initialTargetWidth,
    h: initialTargetHeight,
  });

  const imgRef = useRef(null);
  const wrapperRef = useRef(null);
  const cropBoxRef = useRef(null);
  const previousUrlRef = useRef(null); // Used to clear old previews from memory

  const dragRef = useRef({ x: 0, y: 0 });
  const pinchRef = useRef({ distance: null });
  const allowPanAndZoom = fitMode === "cover";

  // Prevent Page Zooming/Scrolling
  useEffect(() => {
    const box = cropBoxRef.current;
    if (!box) return;

    const handleWheelNative = (e) => {
      if (!allowPanAndZoom) return;
      e.preventDefault();
      const zoomFactor = e.deltaY * -0.002;
      setZoom((prev) => Math.min(Math.max(0.1, prev + zoomFactor), 10));
    };

    box.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => box.removeEventListener("wheel", handleWheelNative);
  }, [allowPanAndZoom]);

  // Update box dimensions on prop change
  useEffect(() => {
    setBoxDimensions({ w: initialTargetWidth, h: initialTargetHeight });
  }, [initialTargetWidth, initialTargetHeight]);

  // ResizeObserver for Freeform mode
  useEffect(() => {
    if (!isFreeform || !cropBoxRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newW = Math.round(entry.contentRect.width / displayScale);
        const newH = Math.round(entry.contentRect.height / displayScale);
        setBoxDimensions({ w: newW || 1, h: newH || 1 });
      }
    });
    observer.observe(cropBoxRef.current);
    return () => observer.disconnect();
  }, [isFreeform, displayScale]);

  // Apply fit modes safely
  const applyFitMode = (mode) => {
    const img = imgRef.current;
    if (!img) return;

    const executeFit = () => {
      setError(null);
      const scaleX = boxDimensions.w / img.naturalWidth;
      const scaleY = boxDimensions.h / img.naturalHeight;
      let newZoom = 1;

      if (mode === "cover") newZoom = Math.max(scaleX, scaleY);
      if (mode === "contain") newZoom = Math.min(scaleX, scaleY);

      setZoom(newZoom);
      setPosition(
        mode === "fill"
          ? { x: 0, y: 0 }
          : {
              x: (boxDimensions.w - img.naturalWidth * newZoom) / 2,
              y: (boxDimensions.h - img.naturalHeight * newZoom) / 2,
            },
      );
    };

    if (img.complete && img.naturalWidth !== 0) {
      executeFit();
    } else {
      img.onload = executeFit;
      img.onerror = () => setError("Failed to load image.");
    }
  };

  useEffect(() => {
    applyFitMode(fitMode);
  }, [imageSrc, boxDimensions.w, boxDimensions.h, fitMode]);

  // UI Scaling
  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current) {
        const availableWidth = wrapperRef.current.clientWidth - 40;
        setDisplayScale(
          boxDimensions.w > availableWidth
            ? availableWidth / boxDimensions.w
            : 1,
        );
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [boxDimensions.w]);

  // Estimate File Size & Generate Live Preview Thumbnail
  useEffect(() => {
    if (!imgRef.current || !imgRef.current.complete || error) return;
    const updatePreview = async () => {
      const zoomX =
        fitMode === "fill"
          ? boxDimensions.w / imgRef.current.naturalWidth
          : zoom;
      const zoomY =
        fitMode === "fill"
          ? boxDimensions.h / imgRef.current.naturalHeight
          : zoom;

      const blob = await getCanvasBlob(
        imgRef.current,
        boxDimensions.w,
        boxDimensions.h,
        position,
        zoomX,
        zoomY,
        format,
        quality,
        bgColor,
      );

      if (blob) {
        setFileSizeKb((blob.size / 1024).toFixed(2));

        // Memory cleanup: remove old url before creating a new one
        if (previousUrlRef.current) URL.revokeObjectURL(previousUrlRef.current);
        const newUrl = URL.createObjectURL(blob);
        previousUrlRef.current = newUrl;
        setPreviewUrl(newUrl);
      }
    };

    // Debounce to prevent lag when sliding quality quickly
    const timeout = setTimeout(updatePreview, 300);
    return () => clearTimeout(timeout);
  }, [
    position,
    zoom,
    fitMode,
    boxDimensions,
    imageSrc,
    format,
    quality,
    bgColor,
    error,
    rotation,
    flip,
  ]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (previousUrlRef.current) URL.revokeObjectURL(previousUrlRef.current);
    };
  }, []);

  // --- Interaction Handlers (Mouse & Touch) ---
  const handleMouseDown = (e) => {
    if (!allowPanAndZoom) return;
    setIsDragging(true);
    dragRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !allowPanAndZoom) return;
    const dx = (e.clientX - dragRef.current.x) / displayScale;
    const dy = (e.clientY - dragRef.current.y) / displayScale;
    dragRef.current = { x: e.clientX, y: e.clientY };
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    if (!allowPanAndZoom) return;
    if (e.touches.length === 2) {
      pinchRef.current.distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      dragRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    if (!allowPanAndZoom) return;
    e.preventDefault();
    if (e.touches.length === 2 && pinchRef.current.distance) {
      const newDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const zoomFactor = (newDistance - pinchRef.current.distance) * 0.01;
      setZoom((prev) => Math.min(Math.max(0.1, prev + zoomFactor), 10));
      pinchRef.current.distance = newDistance;
    } else if (e.touches.length === 1 && isDragging) {
      const dx = (e.touches[0].clientX - dragRef.current.x) / displayScale;
      const dy = (e.touches[0].clientY - dragRef.current.y) / displayScale;
      dragRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    pinchRef.current.distance = null;
  };

  // --- Actions ---
  const handleDownload = async () => {
    const zoomX =
      fitMode === "fill" ? boxDimensions.w / imgRef.current.naturalWidth : zoom;
    const zoomY =
      fitMode === "fill"
        ? boxDimensions.h / imgRef.current.naturalHeight
        : zoom;
    const blob = await getCanvasBlob(
      imgRef.current,
      boxDimensions.w,
      boxDimensions.h,
      position,
      zoomX,
      zoomY,
      format,
      quality,
      bgColor,
    );
    downloadBlob(blob, fileName || "cropped-image");
  };

  if (error) return <div className="error-message">{error}</div>;

  const getTransform = () => {
    if (fitMode === "fill" && imgRef.current) {
      const scaleX = boxDimensions.w / imgRef.current.naturalWidth;
      const scaleY = boxDimensions.h / imgRef.current.naturalHeight;
      return `translate(0px, 0px) scale(${scaleX * displayScale}, ${scaleY * displayScale})`;
    }
    return `translate(${position.x * displayScale}px, ${position.y * displayScale}px) scale(${zoom * displayScale})`;
  };

  return (
    <div className="cropper-ui unselectable">
      <div className="frame-controls" style={{ marginBottom: "15px" }}>
        <strong>Frame Mode: </strong>
        <select value={fitMode} onChange={(e) => setFitMode(e.target.value)}>
          <option value="cover">Cover (Fills box, allows Move/Zoom)</option>
          <option value="contain">Contain (Leaves empty borders)</option>
          <option value="fill">Fill (Stretches image to fit)</option>
        </select>
      </div>

      <div
        ref={wrapperRef}
        style={{
          width: "100%",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          ref={cropBoxRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: `${boxDimensions.w * displayScale}px`,
            height: `${boxDimensions.h * displayScale}px`,
            overflow: "hidden",
            position: "relative",
            border: "2px dashed #444",
            cursor: allowPanAndZoom
              ? isDragging
                ? "grabbing"
                : "grab"
              : "not-allowed",
            backgroundImage:
              bgColor === "transparent"
                ? "repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%)"
                : "none",
            backgroundColor: bgColor !== "transparent" ? bgColor : "#fff",
            backgroundSize: "20px 20px",
            resize: isFreeform ? "both" : "none",
            maxWidth: "100%",
          }}
        >
          {/* Rule of Thirds Grid Overlay */}
          {isDragging && (
            <div className="grid-overlay">
              <div className="grid-line horizontal-1"></div>
              <div className="grid-line horizontal-2"></div>
              <div className="grid-line vertical-1"></div>
              <div className="grid-line vertical-2"></div>
            </div>
          )}
          <img
            ref={imgRef}
            src={imageSrc}
            alt="crop interactive"
            draggable="false"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              maxWidth: "none",
              transform: getTransform(),
              transformOrigin: "0 0",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {isFreeform && (
        <div className="info-badge">
          Size: {boxDimensions.w} x {boxDimensions.h}px
        </div>
      )}

      {allowPanAndZoom && (
        <div className="controls">
          <small
            style={{ color: "#666", display: "block", marginBottom: "8px" }}
          >
            Use Mouse-Wheel or Pinch to Zoom
          </small>
          <div className="export-info">
          <button onClick={() => applyFitMode("cover")}>Reset Center</button>
          <button onClick={onRotate}>Rotate 90°</button>
          <button onClick={onFlip}>Mirror Image</button>
          </div>
        </div>
      )}

      {/* Action Panel with Real-time Preview */}
      <div className="action-panel" style={{ marginTop: "20px" }}>
        <div className="">
          <div className="live-preview-box">
            <small>Final Output Preview:</small>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Export quality preview"
                className="mini-preview"
              />
            ) : (
              <div className="mini-preview skeleton"></div>
            )}
          </div>
          <div className=" export-info">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Custom File Name"
              style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
                />
            <button className="primary-btn" onClick={handleDownload}>
              Download Img
            </button>
                <p>
                  <strong>Est. Size:</strong> ~{fileSizeKb} KB
                </p>
          </div>
        </div>
      </div>
    </div>
  );
}
