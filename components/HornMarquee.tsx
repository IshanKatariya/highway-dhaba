"use client";

const PHRASES = [
  "बुरी नज़र वाले तेरा मुँह काला",
  "HORN OK PLEASE",
  "USE DIPPER AT NIGHT",
  "ओवरटेक मत कर भाई",
  "अभी सफर बाकी है",
  "चाय गरम है",
  "रात में दिप्पर लगाओ",
  "मिले सुर मेरा तुम्हारा",
  "HIGHWAY DHABA",
];

const SEP = "✦";

export default function HornMarquee() {
  const repeated = [...PHRASES, ...PHRASES, ...PHRASES];

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 overflow-hidden"
      aria-hidden="true"
      style={{
        background: "#0c0a07",
        borderTop: "1px solid rgba(184,134,11,0.5)",
        height: "36px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Subtle top edge glow */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg,transparent 0%,rgba(184,134,11,0.6) 20%,rgba(245,166,35,0.9) 50%,rgba(184,134,11,0.6) 80%,transparent 100%)",
        }}
      />

      <div
        className="ticker-track flex items-center whitespace-nowrap will-change-transform"
        style={{ fontFamily: "var(--font-russo), sans-serif" }}
      >
        {repeated.map((phrase, i) => (
          <span key={i} className="inline-flex items-center">
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.3em",
                color: "#c89535",
                textTransform: "uppercase",
                padding: "0 20px",
                fontWeight: 400,
              }}
            >
              {phrase}
            </span>
            <span
              style={{
                fontSize: "8px",
                color: "rgba(184,134,11,0.55)",
                padding: "0 4px",
                flexShrink: 0,
              }}
            >
              {SEP}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}