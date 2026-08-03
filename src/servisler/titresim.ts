// Haptik geri bildirim sarmalayıcısı. Desteklenmeyen cihazlarda sessizce geçer.

import * as Haptics from 'expo-haptics';

export function hafifTitret(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function ortaTitret(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export function basariTitret(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function hataTitret(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}
