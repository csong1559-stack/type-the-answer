import * as htmlToImage from 'html-to-image';
import { isCapacitor } from './platform';

export const exportToPNG = async (
  node: HTMLElement,
  fileName: string,
  opts?: { width?: number; height?: number }
): Promise<{ blob: Blob; dataUrl: string; fileName: string }> => {
  // Pre-export cleanup
  document.body.classList.add('is-exporting');

  try {
    // Ensure web fonts are loaded to keep layout identical to preview
    const fontsAny = (document as any).fonts;
    if (fontsAny?.ready) {
      try { 
        await fontsAny.ready; 
        try {
          await Promise.all([
            fontsAny.load('400 16px "Huiwen-mincho"'),
          ]);
        } catch {}
      } catch {}
    }

    // Use scroll dimensions to capture full content, not just visible box
    const targetWidth = opts?.width ?? Math.ceil(node.scrollWidth || node.getBoundingClientRect().width);
    const targetHeight = opts?.height ?? Math.ceil(node.scrollHeight || node.getBoundingClientRect().height);

    // Dynamic pixel ratio for mobile memory constraints while preserving clarity
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const tryRatios = [dpr, 1.75, 1.5, 1.25, 1];
    let dataUrl: string | null = null;
    for (const ratio of tryRatios) {
      try {
        dataUrl = await htmlToImage.toPng(node, {
          quality: 0.92,
          pixelRatio: ratio,
          backgroundColor: '#fdfbf7',
          skipFonts: true,
          width: targetWidth,
          height: targetHeight,
          style: {
            maxWidth: 'none',
            maxHeight: 'none',
            display: 'block',
            margin: '0',
            fontFamily: '"Huiwen-mincho",monospace',
            fontWeight: '400',
            fontStyle: 'normal',
            fontSynthesis: 'none',
            position: 'relative',
            boxSizing: 'border-box',
            transform: 'none',
            left: '0',
            top: '0',
            overflow: 'visible',
          },
        } as any);
        break;
      } catch {}
    }
    if (!dataUrl) {
      throw new Error('toPng failed at all ratios');
    }

    const dataUrlToBlob = (url: string): Blob => {
      const parts = url.split(',');
      const mime = parts[0].match(/data:(.*?);/i)?.[1] || 'image/png';
      const binary = atob(parts[1]);
      const len = binary.length;
      const buffer = new ArrayBuffer(len);
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([buffer], { type: mime });
    };
    const blob = dataUrlToBlob(dataUrl);
    const fileNameWithExt = `${fileName}.png`;
    return { blob, dataUrl, fileName: fileNameWithExt };
  } catch (err) {
    console.error('Export failed', err);
    alert('Failed to generate image. Please try again.');
  } finally {
    document.body.classList.remove('is-exporting');
  }
};
