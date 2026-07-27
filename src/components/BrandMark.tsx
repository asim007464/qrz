import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  link?: boolean;
  size?: "nav" | "auth" | "tab";
  className?: string;
}

const SIZE_MAP = {
  nav: { width: 120, height: 40, className: "h-8 w-auto" },
  auth: { width: 200, height: 66, className: "h-14 w-auto sm:h-16" },
  tab: { width: 40, height: 40, className: "h-7 w-7 rounded-lg" },
} as const;

export default function BrandMark({ link = true, size = "nav", className }: BrandMarkProps) {
  const dims = SIZE_MAP[size];
  const mark = (
    <Image
      src="/qrz-logo.png"
      alt="QRZ"
      width={dims.width}
      height={dims.height}
      className={cn("object-contain", dims.className, className)}
      priority
    />
  );

  if (link) {
    return (
      <Link href="/" className="brand-mark-link" aria-label="QRZ home">
        {mark}
      </Link>
    );
  }

  return mark;
}
