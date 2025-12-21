import * as htmlToImage from 'html-to-image';
import { isCapacitor } from './platform';

let fontEmbedCSSCache: string | null = null;
const ensureFontEmbedCSS = async (): Promise<string | null> => {
  if (fontEmbedCSSCache) return fontEmbedCSSCache;
  try {
    const res = await fetch('/fonts/huiwenmingchao-font.ttf', { cache: 'force-cache' });
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
    }
    const base64 = btoa(binary);
    fontEmbedCSSCache = `
@font-face {
  font-family: "Huiwen-mincho";
  src: url(data:font/truetype;base64,${base64}) format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: block;
}
`;
    return fontEmbedCSSCache;
  } catch {
    return null;
  }
};

export const exportToPNG = async (
  node: HTMLElement,
  fileName: string,
  opts?: { width?: number; height?: number }
): Promise<{ blob: Blob; dataUrl: string; fileName: string }> => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isWeChatIOS = /MicroMessenger/i.test(ua) && /iPhone|iPad|iPod/i.test(ua);
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
            fontsAny.load('400 18px "Huiwen-mincho"'),
            fontsAny.load('400 20px "Huiwen-mincho"'),
            fontsAny.load('400 24px "Huiwen-mincho"'),
            fontsAny.load('400 30px "Huiwen-mincho"'),
          ]);
        } catch {}
      } catch {}
    }

    // Use scroll dimensions to capture full content, not just visible box
    const targetWidth = opts?.width ?? Math.ceil(node.scrollWidth || node.getBoundingClientRect().width);
    const targetHeight = opts?.height ?? Math.ceil(node.scrollHeight || node.getBoundingClientRect().height);

    if (isWeChatIOS) {
      const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const original = { width: node.style.width, height: node.style.height, overflow: (node.style as any).overflow };
      node.style.width = `${targetWidth}px`;
      node.style.height = `${targetHeight}px`;
      (node.style as any).overflow = 'visible';
      try {
        const h2c = (window as any).html2canvas;
        if (!h2c) throw new Error('html2canvas global not found');
        const canvas = await h2c(node, {
          scale,
          backgroundColor: '#F2EBE3',
          useCORS: true,
          allowTaint: true,
          windowWidth: targetWidth,
          windowHeight: targetHeight,
          scrollX: 0,
          scrollY: 0,
        });
        const dataUrl = canvas.toDataURL('image/png', 0.92);
        const parts = dataUrl.split(',');
        const mime = parts[0].match(/data:(.*?);/i)?.[1] || 'image/png';
        const binary = atob(parts[1]);
        const len = binary.length;
        const buffer = new ArrayBuffer(len);
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([buffer], { type: mime });
        const fileNameWithExt = `${fileName}.png`;
        return { blob, dataUrl, fileName: fileNameWithExt };
      } finally {
        node.style.width = original.width;
        node.style.height = original.height;
        (node.style as any).overflow = original.overflow;
      }
    }

    // Dynamic pixel ratio for mobile memory constraints while preserving clarity
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const tryRatios = [dpr, 1.75, 1.5, 1.25, 1];
    let dataUrl: string | null = null;
    const fontEmbedCSS = await ensureFontEmbedCSS();
    for (const ratio of tryRatios) {
      try {
        dataUrl = await htmlToImage.toPng(node, {
          quality: 0.92,
          pixelRatio: ratio,
          backgroundColor: '#F2EBE3',
          skipFonts: false,
          preferredFontFormat: 'truetype',
          width: targetWidth,
          height: targetHeight,
          fontEmbedCSS: fontEmbedCSS ?? undefined,
          style: {
            maxWidth: 'none',
            maxHeight: 'none',
            display: 'block',
            margin: '0',
            fontFamily: '"Huiwen-mincho",monospace',
            fontWeight: '400',
            fontStyle: 'normal',
            fontSynthesis: 'none',
            color: '#111827',
            WebkitTextStroke: '0px transparent',
            textRendering: 'optimizeLegibility',
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
