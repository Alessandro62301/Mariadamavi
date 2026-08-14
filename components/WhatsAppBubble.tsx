import { WhatsAppIcon } from "./icons";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/siteCta";

export default function WhatsAppBubble() {
  return (
    <a
      className="cta-bubble"
      href={PRIMARY_CTA_HREF}
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
      <span className="sr-only">{PRIMARY_CTA_LABEL}</span>
    </a>
  );
}
