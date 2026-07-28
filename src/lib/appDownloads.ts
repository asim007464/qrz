import { readFile, stat } from "fs/promises";
import path from "path";

const DOWNLOADS_DIR = path.join(process.cwd(), "public", "downloads");

export const ANDROID_APK_NAME = "QRZ.apk";
export const IOS_IPA_NAME = "QRZ.ipa";

function androidApkPath() {
  return path.join(DOWNLOADS_DIR, ANDROID_APK_NAME);
}

function iosIpaPath() {
  return path.join(DOWNLOADS_DIR, IOS_IPA_NAME);
}

export function getAndroidApkRemoteUrl(): string | null {
  const url = process.env.ANDROID_APK_URL?.trim() || process.env.NEXT_PUBLIC_ANDROID_APK_URL?.trim();
  return url || null;
}

export function getIosIpaRemoteUrl(): string | null {
  const url = process.env.IOS_IPA_URL?.trim() || process.env.NEXT_PUBLIC_IOS_IPA_URL?.trim();
  return url || null;
}

export async function androidApkAvailable(): Promise<boolean> {
  if (getAndroidApkRemoteUrl()) return true;
  try {
    const info = await stat(androidApkPath());
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

export async function readAndroidApk(): Promise<Buffer | null> {
  try {
    const info = await stat(androidApkPath());
    if (!info.isFile() || info.size <= 0) return null;
    return await readFile(androidApkPath());
  } catch {
    return null;
  }
}

export async function iosIpaAvailable(): Promise<boolean> {
  if (getIosIpaRemoteUrl()) return true;
  try {
    const info = await stat(iosIpaPath());
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

export async function readIosIpa(): Promise<Buffer | null> {
  try {
    const info = await stat(iosIpaPath());
    if (!info.isFile() || info.size <= 0) return null;
    return await readFile(iosIpaPath());
  } catch {
    return null;
  }
}
