import { ImageResponse } from "next/og";

export const APP_ICON_BG = "#2e1a47";
export const APP_ICON_COLOR = "#a78bfa";

export function generateAppIcon(size: number) {
  const fontSize = Math.round(size * 0.28);

  return new ImageResponse(
    (
      <div
        style={{
          background: APP_ICON_BG,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize,
            fontWeight: 900,
            letterSpacing: "0.08em",
            lineHeight: 1,
            color: APP_ICON_COLOR,
            whiteSpace: "nowrap",
          }}
        >
          QRZ
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
