"use client";

import { FormEvent, useState } from "react";
import styles from "./TrackingExperience.module.css";

type TrackingStep = {
  place: string;
  city: string;
  label: string;
  date: string;
  detail: string;
  icon: string;
};

const demoJourney: TrackingStep[] = [
  {
    place: "Origem",
    city: "Miami, FL",
    label: "Escolhido para você",
    date: "01 AGO · 14:32",
    detail: "Seu iPhone passou pela curadoria e conferência da Mavi.",
    icon: "✦",
  },
  {
    place: "Conexão",
    city: "São Paulo, SP",
    label: "Chegou ao Brasil",
    date: "03 AGO · 08:16",
    detail: "Importação concluída. Agora ele segue em rota nacional.",
    icon: "↘",
  },
  {
    place: "Agora",
    city: "Campinas, SP",
    label: "A caminho de você",
    date: "HOJE · 10:48",
    detail: "Seu pedido está na última conexão antes da entrega.",
    icon: "●",
  },
  {
    place: "Destino",
    city: "Ribeirão Preto, SP",
    label: "Seu momento Mavi",
    date: "PREVISÃO · 07 AGO",
    detail: "Tudo pronto para chegar com segurança no seu endereço.",
    icon: "⌂",
  },
];

export default function TrackingExperience() {
  const [active, setActive] = useState(2);
  const [code, setCode] = useState("MV-4820-2026");
  const [searchedCode, setSearchedCode] = useState("MV-4820-2026");
  const [journey, setJourney] = useState<TrackingStep[]>(demoJourney);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/rastreio/${encodeURIComponent(normalized)}`);
      const data = await response.json() as { code?: string; steps?: TrackingStep[]; error?: string };
      if (!response.ok || !data.steps?.length) throw new Error(data.error || "Nenhum evento encontrado.");
      setSearchedCode(data.code || normalized);
      setJourney(data.steps);
      setActive(data.steps.length - 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível consultar o rastreio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.aurora} aria-hidden="true" />
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="Mavi, voltar ao início">
          MAVI
        </a>
        <div className={styles.secure}><span /> acompanhamento seguro</div>
        <a className={styles.help} href="https://wa.me/5516999999999">Precisa de ajuda? <b>↗</b></a>
      </header>

      <section className={styles.hero}>
        <div className={styles.intro}>
          <p className={styles.kicker}>SUA ENTREGA, AO VIVO</p>
          <h1>Quase nas<br /><i>suas mãos.</i></h1>
          <p className={styles.subtitle}>Cada movimento do seu novo Apple,<br />acompanhado de perto por nós.</p>
          <form className={styles.search} onSubmit={track}>
            <label htmlFor="tracking-code">Código de rastreio</label>
            <div>
              <input id="tracking-code" value={code} onChange={(event) => setCode(event.target.value)} />
              <button aria-label="Rastrear pedido" disabled={loading}>{loading ? "···" : "→"}</button>
            </div>
            {error && <p className={styles.trackError} role="status">{error}</p>}
          </form>
        </div>

        <div className={styles.stage}>
          <div className={styles.mobileJourney}>
            <div className={styles.trackingSummary}>
              <div className={styles.summaryOrder}>
                <small>Seu pedido</small>
                <strong>{searchedCode}</strong>
                <span><i /> acompanhamento ativo</span>
              </div>
              <div className={styles.summaryState}>
                <span className={styles.summaryIcon}>{journey[active].icon}</span>
                <div>
                  <small>{journey[active].place} · {journey[active].date}</small>
                  <strong>{journey[active].label}</strong>
                  <p>{journey[active].detail}</p>
                </div>
              </div>
            </div>
            <div className={styles.wallHeading}>
              <span>O CAMINHO ATÉ VOCÊ</span>
              <p>Toque em cada parada para acompanhar a história da sua entrega.</p>
            </div>
            <div className={styles.wallPath}>
              {journey.map((step, index) => (
                <div
                  className={`${styles.wallRow} ${index <= active ? styles.wallReached : ""} ${active === index ? styles.wallCurrent : ""}`}
                  key={`${step.label}-${index}`}
                >
                  {index < journey.length - 1 && <span className={styles.wallConnector} />}
                  <button className={styles.wallStop} onClick={() => setActive(index)} aria-label={`Ver etapa ${index + 1}: ${step.label}`}>
                    <span className={styles.wallDot}>{index < active ? "✓" : String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.wallArm} />
                    {(index === 0 || index === journey.length - 1) && (
                      <span
                        className={styles.wallTransport}
                        data-kind={index === 0 ? "plane" : "home"}
                        aria-hidden="true"
                      />
                    )}
                    <span className={styles.wallCard}>
                      <small>{step.date}</small>
                      <strong>{step.label}</strong>
                      <em>{step.city}</em>
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p><span>✦</span> A gente acompanha até chegar. De verdade.</p>
        <p>Rastreamento por <a href="https://www.siterastreio.com.br" target="_blank" rel="noreferrer">Site Rastreio</a></p>
      </footer>
    </main>
  );
}
