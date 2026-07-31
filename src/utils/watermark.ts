import { WatermarkSettings, WatermarkPosition } from '../types';

export const DEFAULT_WATERMARK_SETTINGS: WatermarkSettings = {
  enabled: true,
  text: '© Luiis David',
  position: 'bottom-right',
  size: 'medium',
  opacity: 0.75,
  margin: 20
};

/**
 * Apply a rendered typography watermark to an image using HTML5 Canvas.
 * Returns base64 data URL of watermarked image.
 */
export async function processImageWatermark(
  imageSrc: string,
  settings: Partial<WatermarkSettings> = {}
): Promise<{ watermarkedUrl: string; thumbnailUrl: string }> {
  const config: WatermarkSettings = {
    ...DEFAULT_WATERMARK_SETTINGS,
    ...settings
  };

  return new Promise((resolve) => {
    const img = new Image();
    // Only set crossOrigin for remote HTTP/HTTPS URLs, NOT for data: or blob: URLs
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        // 1. Create main watermarked canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve({ watermarkedUrl: imageSrc, thumbnailUrl: imageSrc });
        }

        // Draw base image
        ctx.drawImage(img, 0, 0);

      // Render watermark if enabled
      if (config.enabled && config.text.trim()) {
        ctx.save();

        // Calculate font size based on image size and setting
        const minDim = Math.min(img.width, img.height);
        let scaleFactor = 0.035; // medium
        if (config.size === 'small') scaleFactor = 0.022;
        if (config.size === 'large') scaleFactor = 0.055;

        const fontSize = Math.max(14, Math.round(minDim * scaleFactor));
        ctx.font = `bold ${fontSize}px "Times New Roman", Georgia, serif`;
        ctx.globalAlpha = Math.min(Math.max(config.opacity, 0.1), 1.0);

        // Measure text
        const textMetrics = ctx.measureText(config.text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;

        const margin = Math.max(config.margin, 10);
        let x = margin;
        let y = margin + textHeight;

        // Determine position coordinates
        switch (config.position) {
          case 'top-left':
            x = margin;
            y = margin + textHeight;
            break;
          case 'top-center':
            x = (img.width - textWidth) / 2;
            y = margin + textHeight;
            break;
          case 'top-right':
            x = img.width - textWidth - margin;
            y = margin + textHeight;
            break;
          case 'center':
            x = (img.width - textWidth) / 2;
            y = (img.height + textHeight) / 2;
            break;
          case 'bottom-left':
            x = margin;
            y = img.height - margin;
            break;
          case 'bottom-center':
            x = (img.width - textWidth) / 2;
            y = img.height - margin;
            break;
          case 'bottom-right':
          default:
            x = img.width - textWidth - margin;
            y = img.height - margin;
            break;
        }

        // Draw semi-transparent subtle background pill for legibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        const padX = Math.round(fontSize * 0.4);
        const padY = Math.round(fontSize * 0.25);
        ctx.beginPath();
        ctx.roundRect(
          x - padX,
          y - textHeight + (padY / 2),
          textWidth + (padX * 2),
          textHeight + (padY * 1.5),
          6
        );
        ctx.fill();

        // Draw text with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(config.text, x, y);

        ctx.restore();
      }

      const watermarkedUrl = canvas.toDataURL('image/jpeg', 0.92);

      // 2. Create thumbnail (max 400px width)
      const thumbCanvas = document.createElement('canvas');
      const thumbWidth = Math.min(400, img.width || 400);
      const thumbHeight = Math.round((thumbWidth / (img.width || 400)) * (img.height || 300));
      thumbCanvas.width = thumbWidth;
      thumbCanvas.height = thumbHeight;
      const thumbCtx = thumbCanvas.getContext('2d');

      if (thumbCtx) {
        thumbCtx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
      }

      const thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.85);

      resolve({ watermarkedUrl, thumbnailUrl });
      } catch (err) {
        console.warn('Canvas watermarking warning, falling back to original image:', err);
        resolve({ watermarkedUrl: imageSrc, thumbnailUrl: imageSrc });
      }
    };

    img.onerror = (err) => {
      console.warn('Failed to load image element for watermarking, fallback to raw source:', err);
      resolve({ watermarkedUrl: imageSrc, thumbnailUrl: imageSrc });
    };

    img.src = imageSrc;
  });
}
