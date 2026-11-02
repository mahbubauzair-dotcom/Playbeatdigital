import confetti from 'canvas-confetti';

/**
 * Fires a refined, elegant celebration confetti burst for successful tool actions.
 * Respects user's reduced-motion preference.
 */
export function triggerSuccessCelebration() {
  if (typeof window === 'undefined') return;

  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  try {
    confetti({
      particleCount: 42,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B'],
      disableForReducedMotion: true,
      scalar: 0.85,
      ticks: 160,
    });
  } catch {
    // Graceful silent fallback if canvas context is restricted
  }
}
