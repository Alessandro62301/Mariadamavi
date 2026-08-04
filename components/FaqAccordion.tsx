"use client";

import { useState } from "react";
import { ChevronDownIcon } from "./icons";

export type FaqEntry = { pergunta: string; resposta: string };

export function FaqItem({ pergunta, resposta }: FaqEntry) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="faq-item">
      <button
        className="faq-q"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        {pergunta}
        <ChevronDownIcon className="ic seta" />
      </button>
      <div className="faq-a" hidden={!aberto}>
        {resposta}
      </div>
    </div>
  );
}

export default function FaqAccordion({ items }: { items: FaqEntry[] }) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <FaqItem key={item.pergunta} {...item} />
      ))}
    </div>
  );
}
