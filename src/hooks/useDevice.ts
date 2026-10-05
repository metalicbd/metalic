import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  windowWidth: number;
  windowHeight: number;
}

/**
 * কাস্টমারের ডিভাইস (মোবাইল, ট্যাবলেট বা পিসি) রিয়েল-টাইমে স্বয়ংক্রিয়ভাবে ডিটেক্ট করার জন্য কাস্টম হুক
 */
export function useDevice(): DeviceInfo {
  const getDeviceInfo = (): DeviceInfo => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        orientation: 'landscape',
        windowWidth: 1200,
        windowHeight: 800,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;

    return {
      isMobile: width < 768, // মোবাইল স্ক্রিন (৭৬৮ পিক্সেলের নিচে)
      isTablet: width >= 768 && width < 1024, // ট্যাবলেট স্ক্রিন
      isDesktop: width >= 1024, // পিসি বা ল্যাপটপ
      isTouchDevice: Boolean(isTouch), // টাচস্ক্রিন নাকি মাউস
      orientation: width >= height ? 'landscape' : 'portrait',
      windowWidth: width,
      windowHeight: height,
    };
  };

  const [device, setDevice] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: number | null = null;

    const handleResize = () => {
      // অতিরিক্ত রি-রেন্ডার এড়াতে এবং ব্রাউজারের গতি ফাস্ট রাখতে ডিবউন্স (Debounce)
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        setDevice(getDeviceInfo());
      }, 60);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return device;
}