import Image from "next/image";
import { cn } from "@/lib/utils";

type AppIconProps = {
  size?: number;
  className?: string;
};

export function AppIcon({ size = 48, className }: AppIconProps) {
  return (
    <Image
      src="/qrz-app-icon.png"
      alt="QRZ"
      width={size}
      height={size}
      className={cn("rounded-2xl object-cover bg-black", className)}
      priority
    />
  );
}
