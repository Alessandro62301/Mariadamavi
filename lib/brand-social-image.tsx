import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const brandSocialImageSize = {
  width: 1200,
  height: 630,
};

export async function createBrandSocialImage() {
  const image = await readFile(
    join(process.cwd(), "public/imgs/maria-victoria-apple-hero-v2.png"),
  );
  const imageUrl = `data:image/png;base64,${image.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          overflow: "hidden",
          background: "#100b0e",
          color: "#F7F0E8",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          width={1200}
          height={675}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "linear-gradient(90deg, rgba(16,11,14,.98) 0%, rgba(16,11,14,.86) 38%, rgba(16,11,14,.06) 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 18,
            display: "flex",
            background: "#F47FA4",
          }}
        />
        <div
          style={{
            position: "relative",
            width: 670,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "58px 0 52px 70px",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#F47FA4",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: ".16em",
              marginBottom: 28,
            }}
          >
            MARIADAMAVI
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 590,
              fontSize: 72,
              fontWeight: 900,
              lineHeight: .92,
              letterSpacing: "-.04em",
            }}
          >
            Seu próximo Apple, com orientação de verdade.
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 570,
              marginTop: 32,
              color: "rgba(247,240,232,.8)",
              fontSize: 24,
              lineHeight: 1.35,
            }}
          >
            Atendimento pessoal • Contrato • Nota fiscal • Entrega em todo o Brasil
          </div>
        </div>
      </div>
    ),
    brandSocialImageSize,
  );
}
