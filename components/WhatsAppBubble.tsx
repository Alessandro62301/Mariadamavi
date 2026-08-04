import { WhatsAppIcon } from "./icons";

export default function WhatsAppBubble() {
  return (
    <a
      className="cta-bubble"
      href={`https://wa.me/5521920184210?text=${encodeURIComponent(
        "Oi, Mavi! Vim pelo site e quero ajuda para escolher meu próximo Apple."
      )}`}
    >
      <span
        className="cta-bubble-avatar"
        role="img"
        aria-label="[SUBSTITUIR: foto real de Maria Victória]"
      >
        👩🏻
      </span>
      <span className="cta-bubble-badge" aria-hidden="true">
        <WhatsAppIcon className="ic" />
      </span>
      <span className="sr-only">Conversar com a Mavi no WhatsApp</span>
    </a>
  );
}
