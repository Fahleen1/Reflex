import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Reflex — Never lose a missed call lead";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background:
            "linear-gradient(135deg, #e0f2fe 0%, #c7d2fe 45%, #ddd6fe 100%)",
          color: "#020617",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          Reflex
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          Never lose a missed call lead again
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 26,
            color: "#475569",
            maxWidth: 800,
          }}
        >
          Instant SMS or WhatsApp follow-up when you can&apos;t pick up.
        </div>
      </div>
    ),
    { ...size },
  );
}
