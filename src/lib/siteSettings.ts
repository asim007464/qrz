export type LockdownSettings = { enabled: boolean; message?: string };

export const DEFAULT_LOCKDOWN: LockdownSettings = {
  enabled: false,
  message: "QRZ is temporarily offline for maintenance. Please check back soon.",
};
