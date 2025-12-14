export const isCapacitor = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).Capacitor;
};

export const getPlatform = () => {
  if (isCapacitor()) {
    const platform = (window as any).Capacitor.getPlatform();
    return platform; // 'ios', 'android', or 'web'
  }
  return 'web';
};
