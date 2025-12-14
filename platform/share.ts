import { isCapacitor } from './platform';

export const shareContent = async (title: string, text: string, url?: string) => {
  if (isCapacitor()) {
    // TODO: Implement Capacitor Share plugin
    // await Share.share({ title, text, url });
    console.log('Capacitor share triggered');
  } else {
    // Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      // Fallback
      alert('Sharing is not supported on this browser. Image downloaded instead.');
    }
  }
};
