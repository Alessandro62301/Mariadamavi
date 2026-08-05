import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "#171014",
          color: "#F47FA4",
          fontSize: 132,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.08em",
        }}
      >
        M
      </div>
    ),
    size,
  );
}
