// src/utils/soundPlayer.ts

/**
 * Simple sound player for notification alerts.
 * Usage: if (enabled) playNotificationSound();
 */
export const playNotificationSound = (enabled: boolean) => {
  if (!enabled) return;
  try {
    const audio = new Audio('/assets/notification.mp3'); // ensure the file exists in public/assets
    audio.play().catch(() => {
      // silent fail – browsers may block autoplay without user interaction
    });
  } catch (e) {
    console.warn('Notification sound error', e);
  }
};
