"use client";

const PHRASES = [
  "बुरी नज़र वाले तेरा मुँह काला",
  "HORN OK PLEASE",
  "USE DIPPER AT NIGHT",
  "रात में दिप्पर लगाओ",
  "मिले सुर मेरा तुम्हारा",
  "HIGHWAY DHABA",
];

export default function HornMarquee() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 text-[#e8a13d]"
      aria-hidden="true"
      style={{
        background: "#1a120b",
        borderTop: "3px double #a5651f",
        borderBottom: "3px double #a5651f",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.5)",
      }}
    >
      <div className="overflow-hidden px-5 py-3">
        <div
          className="ticker-track flex items-center whitespace-nowrap gap-4 text-[13px] uppercase tracking-[0.15em] font-bold"
          style={{ fontFamily: "var(--font-russo), sans-serif" }}
        >
          {[...PHRASES, ...PHRASES].map((phrase, index) => (
            <span key={index} className="flex items-center gap-4">
              <span
                className="text-[#e8a13d]"
                style={{ textShadow: "0 0 6px rgba(232,161,61,0.35)" }}
              >
                {phrase}
              </span>
              <span className="text-[#a5651f] text-[14px] select-none">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}