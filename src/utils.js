// // src/utils.js

// export const calculateDimensions = (w, h, unit) => {
//   const DPI = 96;
//   const CM_TO_PX = DPI / 2.54;
//   const width = Math.max(1, Number(w) || 1);
//   const height = Math.max(1, Number(h) || 1);

//   switch (unit) {
//     case 'cm':
//       return { targetWidth: width * CM_TO_PX, targetHeight: height * CM_TO_PX };
//     case 'in':
//       return { targetWidth: width * DPI, targetHeight: height * DPI };
//     case 'ratio':
//       // Base width of 800px, calculates height based on ratio provided
//       return { targetWidth: 800, targetHeight: 800 * (height / width) };
//     case 'px':
//     default:
//       return { targetWidth: width, targetHeight: height };
//   }
// };

// export const cropAndDownload = (imgElement, targetWidth, targetHeight, position, zoom, filename = 'cropped.png') => {
//   const canvas = document.createElement('canvas');
//   canvas.width = targetWidth;
//   canvas.height = targetHeight;
//   const ctx = canvas.getContext('2d');

//   // Fill white background in case image doesn't cover edges
//   ctx.fillStyle = '#ffffff';
//   ctx.fillRect(0, 0, targetWidth, targetHeight);

//   // Translate and scale the canvas exactly like our CSS transforms
//   ctx.translate(position.x, position.y);
//   ctx.scale(zoom, zoom);
//   ctx.drawImage(imgElement, 0, 0);

//   // Trigger download
//   const dataUrl = canvas.toDataURL('image/png', 1.0);
//   const link = document.createElement('a');
//   link.download = filename;
//   link.href = dataUrl;
//   link.click();
// };

// src/utils.js

// export const calculateDimensions = (w, h, unit, dpi = 96) => {
//   const CM_TO_INCH = 1 / 2.54;
//   const width = Math.max(1, Number(w) || 1);
//   const height = Math.max(1, Number(h) || 1);

//   switch (unit) {
//     case 'cm':
//       return { targetWidth: Math.round(width * CM_TO_INCH * dpi), targetHeight: Math.round(height * CM_TO_INCH * dpi) };
//     case 'in':
//       return { targetWidth: Math.round(width * dpi), targetHeight: Math.round(height * dpi) };
//     case 'ratio':
//       return { targetWidth: 800, targetHeight: Math.round(800 * (height / width)) };
//     case 'px':
//     default:
//       return { targetWidth: width, targetHeight: height };
//   }
// };

// export const getCanvasBlob = (imgElement, targetWidth, targetHeight, position, zoomX, zoomY) => {
//   return new Promise((resolve) => {
//     const canvas = document.createElement('canvas');
//     canvas.width = targetWidth;
//     canvas.height = targetHeight;
//     const ctx = canvas.getContext('2d');

//     // Fill background
//     ctx.fillStyle = '#ffffff';
//     ctx.fillRect(0, 0, targetWidth, targetHeight);

//     ctx.translate(position.x, position.y);
//     ctx.scale(zoomX, zoomY);
//     ctx.drawImage(imgElement, 0, 0);

//     canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
//   });
// };

// export const downloadBlob = (blob, filename = 'cropped.jpg') => {
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.download = filename;
//   link.click();
//   URL.revokeObjectURL(url);
// };

// src/utils.js

export const calculateDimensions = (w, h, unit, dpi = 96) => {
    const CM_TO_INCH = 1 / 2.54;
    const width = Math.max(1, Number(w) || 1);
    const height = Math.max(1, Number(h) || 1);

    switch (unit) {
        case 'cm':
            return { targetWidth: Math.round(width * CM_TO_INCH * dpi), targetHeight: Math.round(height * CM_TO_INCH * dpi) };
        case 'in':
            return { targetWidth: Math.round(width * dpi), targetHeight: Math.round(height * dpi) };
        case 'ratio':
            return { targetWidth: 800, targetHeight: Math.round(800 * (height / width)) };
        case 'freeform':
        case 'px':
        default:
            return { targetWidth: width, targetHeight: height };
    }
};

// REPLACE getCanvasBlob with this clean version
export const getCanvasBlob = (imgElement, targetWidth, targetHeight, position, zoomX, zoomY, format = 'image/jpeg', quality = 0.9, bgColor = '#ffffff') => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (bgColor === 'transparent') {
            ctx.clearRect(0, 0, targetWidth, targetHeight);
        } else {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.translate(position.x, position.y);
        ctx.scale(zoomX, zoomY);
        ctx.drawImage(imgElement, 0, 0);

        canvas.toBlob((blob) => resolve(blob), format, quality);
    });
};

// ADD THESE NEW FUNCTIONS AT THE BOTTOM
export const rotateImageSrc = (imageSrc, degrees = 90) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Swap canvas dimensions for 90 degree rotation
            canvas.width = img.naturalHeight;
            canvas.height = img.naturalWidth;
            const ctx = canvas.getContext('2d');

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((degrees * Math.PI) / 180);
            ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
            resolve(canvas.toDataURL('image/png', 1.0)); // Lossless export
        };
        img.src = imageSrc;
    });
};

export const flipImageSrc = (imageSrc) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png', 1.0));
        };
        img.src = imageSrc;
    });
};

export const downloadBlob = (blob, filename = 'cropped-image') => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Assign correct extension
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    link.download = `${filename}.${ext}`;

    link.click();
    URL.revokeObjectURL(url);
};