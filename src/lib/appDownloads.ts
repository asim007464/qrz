import { access, readFile } from "fs/promises";
import path from "path";
import { constants } from "fs";

const DOWNLOADS_DIR = path.join(process.cwd(), "public", "downloads");

const ANDROID_APK_NAME = "QRZ.apk";
const IOS_IPA_NAME = "QRZ.ipa";

export async function androidApkAvailable(): Promise<boolean> {
  try {
    await access(path.join(DOWNLOADS_DIR, ANDROID_APK_NAME), constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readAndroidApk(): Promise<Buffer | null> {
  try {
    return await readFile(path.join(DOWNLOADS_DIR, ANDROID_APK_NAME));
  } catch {
    return null;
  }
}

export async function iosIpaAvailable(): Promise<boolean> {
  try {
    await access(path.join(DOWNLOADS_DIR, IOS_IPA_NAME), constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readIosIpa(): Promise<Buffer | null> {
  try {
    return await readFile(path.join(DOWNLOADS_DIR, IOS_IPA_NAME));
  } catch {
    return null;
  }
}
