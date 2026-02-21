import * as Haptics from "expo-haptics";

/**
 * Triggers a light impact haptic. Safe to call on any platform;
 * failures (e.g. simulator, web) are ignored.
 */
export function triggerLightImpact(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
