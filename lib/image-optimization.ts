/**
 * Image optimization and compression utility for browser client uploads.
 * Ensures images are resized, center-cropped to 16:9 aspect-video (when requested),
 * and compressed to modern WebP format before uploading to Supabase Storage.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  force16x9?: boolean;
}

export async function optimizeImageForUpload(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<File> {
  // Server-side or non-browser guard
  if (typeof window === "undefined" || !file || !file.type.startsWith("image/")) {
    return file;
  }

  // Skip SVGs and GIF animations to prevent losing vector data or animation frames
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  const {
    maxWidth = 1280,
    maxHeight = 720,
    quality = 0.82,
    force16x9 = true,
  } = options;

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(file);
            return;
          }

          let targetWidth = img.naturalWidth;
          let targetHeight = img.naturalHeight;
          let sx = 0;
          let sy = 0;
          let sWidth = img.naturalWidth;
          let sHeight = img.naturalHeight;

          if (force16x9) {
            // Target 16:9 aspect ratio
            const targetRatio = 16 / 9;
            const currentRatio = img.naturalWidth / img.naturalHeight;

            if (currentRatio > targetRatio) {
              // Image is wider than 16:9 -> crop horizontal sides
              sWidth = img.naturalHeight * targetRatio;
              sHeight = img.naturalHeight;
              sx = (img.naturalWidth - sWidth) / 2;
              sy = 0;
            } else {
              // Image is taller than 16:9 (e.g. portrait) -> crop vertical top/bottom
              sWidth = img.naturalWidth;
              sHeight = img.naturalWidth / targetRatio;
              sx = 0;
              sy = (img.naturalHeight - sHeight) / 2;
            }

            // Cap dimensions to maxWidth / maxHeight while preserving 16:9
            targetWidth = Math.min(maxWidth, sWidth);
            targetHeight = Math.round(targetWidth / targetRatio);
          } else {
            // Proportional resize without cropping
            if (targetWidth > maxWidth || targetHeight > maxHeight) {
              const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
              targetWidth = Math.round(targetWidth * ratio);
              targetHeight = Math.round(targetHeight * ratio);
            }
          }

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Enable high quality image scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Draw cropped & resized image
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              // Create clean webp file name
              const originalBaseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
              const cleanFileName = `${originalBaseName.replace(/[^a-zA-Z0-9_-]/g, "_")}.webp`;

              const optimizedFile = new File([blob], cleanFileName, {
                type: "image/webp",
                lastModified: Date.now(),
              });

              resolve(optimizedFile);
            },
            "image/webp",
            quality
          );
        } catch (err) {
          console.warn("Image canvas optimization failed, using original file:", err);
          resolve(file);
        }
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
