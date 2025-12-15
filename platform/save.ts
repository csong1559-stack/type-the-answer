import * as htmlToImage from 'html-to-image';
import { isCapacitor } from './platform';

export const exportToPNG = async (
  node: HTMLElement,
  fileName: string,
  opts?: { width?: number; height?: number }
): Promise<void> => {
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
            fontsAny.load('16px "Huiwen-mincho"'),
          ]);
        } catch {}
      } catch {}
    }

    // Use scroll dimensions to capture full content, not just visible box
    const targetWidth = opts?.width ?? Math.ceil(node.scrollWidth || node.getBoundingClientRect().width);
    const targetHeight = opts?.height ?? Math.ceil(node.scrollHeight || node.getBoundingClientRect().height);

    // Dynamic pixel ratio for mobile memory constraints while preserving clarity
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const dataUrl = await htmlToImage.toPng(node, {
      quality: 0.92,
      pixelRatio: dpr,
      backgroundColor: '#fdfbf7',
      skipFonts: false,
      width: targetWidth,
      height: targetHeight,
      style: {
        maxWidth: 'none',
        maxHeight: 'none',
        display: 'block',
        margin: '0',
        fontFamily: '"Huiwen-mincho",monospace',
        position: 'relative',
        boxSizing: 'border-box',
        transform: 'none',
        left: '0',
        top: '0',
        overflow: 'visible',
      },
    } as any);

    if (isCapacitor()) {
      // TODO: Implement Capacitor Filesystem/Media write logic here
      // const result = await Filesystem.writeFile(...)
      console.log('Capacitor save logic would go here');
    } else {
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.rel = 'noopener';
      link.click();
    }
  } catch (err) {
    console.error('Export failed', err);
    alert('Failed to generate image. Please try again.');
  } finally {
    document.body.classList.remove('is-exporting');
  }
};


