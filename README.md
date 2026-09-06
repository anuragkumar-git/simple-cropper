# Simple Cropper & Image Resizer 🖼️

A lightweight, lightning-fast, and privacy-focused Progressive Web Application (PWA) built with **React** and **Vite**. Crop, resize, compress, rotate, and convert images entirely client-side with zero server uploads.

## ✨ Key Features

* **Flexible Unit Conversions:** Resize images using **Pixels (px)**, **Centimeters (cm)**, **Inches (in)**, **Aspect Ratios**, or **Freeform Drag-to-Resize**.
* **Physical Print Ready:** Custom **DPI (Dots Per Inch)** settings for accurate print sizing.
* **Smart Framing & Positioning:** Switch seamlessly between **Cover**, **Contain**, and **Fill** modes. Includes smooth panning and touch pinch-to-zoom support.
* **Image Compression:** Instantly optimize file sizes using the live quality slider with real-time visual previews and size estimation.
* **Background & Transparency Control:** Choose between White, Black, Transparent (PNG/WebP), or Custom HEX background colors using a native color picker.
* **Transformations:** Quick 90-degree rotations and horizontal mirroring (flipping).
* **100% Offline-First (PWA):** Fully functional offline service workers cached via Workbox. Install it on desktop or mobile just like a native app.
* **Zero Server Latency:** All canvas rendering and data processing happen locally in your browser for absolute privacy.

---

## 🚀 Tech Stack

* **Framework:** React (Vite)
* **Styling:** Vanilla CSS (Responsive for Mobile, Tablet, and Desktop)
* **Image Processing:** HTML5 Canvas API (`HTMLCanvasElement.toBlob`)
* **PWA & Offline Storage:** Vite PWA Plugin / Workbox