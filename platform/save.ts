import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { isCapacitor } from './platform';

export const exportToPNG = async (
  node: HTMLElement,
  fileName: string,
  opts?: { width?: number; height?: number }
): Promise<void> => {
  // Pre-export cleanup
  document.body.classList.add('is-exporting');

  try {
    const dataUrl = await htmlToImage.toPng(node, {
      quality: 0.95,
      pixelRatio: 3,
      backgroundColor: '#fdfbf7',
      skipFonts: true,
      width: opts?.width,
      height: opts?.height,
      style: {
        width: opts?.width ? `${opts.width}px` : undefined,
        height: opts?.height ? `${opts.height}px` : undefined,
        maxWidth: 'none',
        maxHeight: 'none',
        display: 'block',
        margin: '0',
        position: 'relative',
        boxSizing: 'border-box',
      },
    } as any);

    if (isCapacitor()) {
      // TODO: Implement Capacitor Filesystem/Media write logic here
      // const result = await Filesystem.writeFile(...)
      console.log('Capacitor save logic would go here');
    } else {
      // Web Download
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    }
  } catch (err) {
    console.error('Export failed', err);
    alert('Failed to generate image. Please try again.');
  } finally {
    document.body.classList.remove('is-exporting');
  }
};

export const exportToPDF = async (node: HTMLElement, fileName: string): Promise<void> => {
  document.body.classList.add('is-exporting');

  try {
    const dataUrl = await htmlToImage.toPng(node, {
      quality: 0.95,
      pixelRatio: 2,
      skipFonts: true,
    } as any);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Logic to center image and fit within margins
    const margin = 20;
    const maxContentWidth = pdfWidth - (margin * 2);
    const ratio = maxContentWidth / imgProps.width;
    const finalHeight = imgProps.height * ratio;

    const yPos = (pdfHeight - finalHeight) / 2;

    pdf.addImage(dataUrl, 'PNG', margin, yPos, maxContentWidth, finalHeight);
    pdf.save(`${fileName}.pdf`);

  } catch (err) {
    console.error('PDF Export failed', err);
    alert('Failed to generate PDF.');
  } finally {
    document.body.classList.remove('is-exporting');
  }
};
