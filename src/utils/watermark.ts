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
    let attempts = 0;

    img.onload = () => {
      try {
        // Calculate dimensions with downscaling if image is extremely large (max 1200px width/height)
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width || 800;
        let height = img.height || 600;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        // 1. Create main watermarked canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve({ watermarkedUrl: imageSrc, thumbnailUrl: imageSrc });
        }

        // Draw base image (applying downscale)
        ctx.drawImage(img, 0, 0, width, height);

        // Render watermark if enabled
        if (config.enabled && config.text.trim()) {
          ctx.save();

          // Calculate font size based on image size and setting
          const minDim = Math.min(width, height);
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
              x = (width - textWidth) / 2;
              y = margin + textHeight;
              break;
            case 'top-right':
              x = width - textWidth - margin;
              y = margin + textHeight;
              break;
            case 'center':
              x = (width - textWidth) / 2;
              y = (height + textHeight) / 2;
              break;
            case 'bottom-left':
              x = margin;
              y = height - margin;
              break;
            case 'bottom-center':
              x = (width - textWidth) / 2;
              y = height - margin;
              break;
            case 'bottom-right':
            default:
              x = width - textWidth - margin;
              y = height - margin;
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
        const thumbWidth = Math.min(400, width || 400);
        const thumbHeight = Math.round((thumbWidth / (width || 400)) * (height || 300));
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

    const loadImg = (url: string, useCrossOrigin: boolean) => {
      if (useCrossOrigin) {
        img.crossOrigin = 'anonymous';
      } else {
        img.removeAttribute('crossorigin');
      }
      img.src = url;
    };

    img.onerror = (err) => {
      if (attempts === 0 && (imageSrc.startsWith('http://') || imageSrc.startsWith('https://'))) {
        attempts++;
        console.warn('Proxy watermarking failed, attempting fallback to raw source without crossOrigin:', err);
        loadImg(imageSrc, false);
      } else {
        console.warn('All image loading attempts failed for watermarking, fallback to raw source:', err);
        resolve({ watermarkedUrl: imageSrc, thumbnailUrl: imageSrc });
      }
    };

    // Route through proxy if external HTTP/HTTPS to bypass CORS perfectly
    if ((imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) && !imageSrc.includes('/api/proxy-image')) {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageSrc)}`;
      loadImg(proxyUrl, true);
    } else {
      loadImg(imageSrc, false);
    }
  });
}
