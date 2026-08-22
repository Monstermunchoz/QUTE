import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "QUTE — Qui, Où, Ce soir";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,45,135,0.18), transparent 70%)",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://qute-olive.vercel.app/logo-icon.png"
          alt="QUTE"
          width={300}
          height={300}
          style={{ objectFit: "contain" }}
        />
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.18em",
            marginTop: 24,
          }}
        >
          QUTE
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#888888",
            letterSpacing: "0.22em",
            marginTop: 12,
          }}
        >
          QUI · OÙ · CE SOIR
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#FF2D87",
            marginTop: 36,
          }}
        >
          Le réseau social queer de Lyon
        </div>
      </div>
    ),
    { ...size },
  );
}
