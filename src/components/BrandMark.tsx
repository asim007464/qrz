import Link from "next/link";

interface BrandMarkProps {
  link?: boolean;
  size?: "nav" | "auth";
}

export default function BrandMark({ link = true, size = "nav" }: BrandMarkProps) {
  const mark = <span className={`brand-wordmark brand-wordmark--${size}`}>QRZ</span>;

  if (link) {
    return (
      <Link href="/" className="brand-mark-link" aria-label="QRZ home">
        {mark}
      </Link>
    );
  }

  return mark;
}
