"use client";

import { FormEvent, useState } from "react";
import styles from "./TrackingExperience.module.css";

const journey = [
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
] as const;

export default function TrackingExperience() {
  const [active, setActive] = useState(2);
  const [code, setCode] = useState("MV-4820-2026");
  const [searchedCode, setSearchedCode] = useState("MV-4820-2026");

  function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized) setSearchedCode(normalized);
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
              <button aria-label="Rastrear pedido">→</button>
            </div>
          </form>
        </div>

        <div className={styles.stage} style={{ "--active-step": active } as React.CSSProperties}>
          <div className={styles.stageTop}>
            <div><span>Pedido</span><strong>{searchedCode}</strong></div>
            <p><span /> Em movimento</p>
          </div>

          <div className={styles.map} aria-label="Mapa interativo da rota da sua encomenda">
            <div className={styles.mapGrid} aria-hidden="true" />
            <div className={styles.landOne} aria-hidden="true" />
            <div className={styles.landTwo} aria-hidden="true" />
            <div className={styles.landThree} aria-hidden="true" />
            <div className={styles.route} aria-hidden="true">
              <i className={styles.lineOne} /><i className={styles.lineTwo} /><i className={styles.lineThree} />
              <span className={styles.traveler}><b>⌁</b></span>
            </div>

            {journey.map((step, index) => (
              <button
                key={step.city}
                className={`${styles.pin} ${styles[`pin${index}`]} ${active === index ? styles.pinActive : ""}`}
                onClick={() => setActive(index)}
                aria-label={`Ver etapa: ${step.label}, ${step.city}`}
                aria-pressed={active === index}
              >
                <span>{step.icon}</span>
                <small>{step.city.split(",")[0]}</small>
              </button>
            ))}

            <article className={styles.floatCard}>
              <div className={styles.floatIcon}>{journey[active].icon}</div>
              <div>
                <span>{journey[active].place} · {journey[active].date}</span>
                <strong>{journey[active].label}</strong>
                <p>{journey[active].detail}</p>
              </div>
            </article>
            <div className={styles.compass} aria-hidden="true"><b>N</b><span>✦</span></div>
          </div>
        </div>
      </section>

      <section className={styles.timeline} aria-label="Etapas da entrega">
        <div className={styles.progress}><span style={{ width: `${(active / 3) * 100}%` }} /></div>
        {journey.map((step, index) => (
          <button key={step.label} onClick={() => setActive(index)} className={active === index ? styles.current : ""}>
            <span className={styles.stepNumber}>{index < active ? "✓" : String(index + 1).padStart(2, "0")}</span>
            <span><small>{step.date}</small><strong>{step.label}</strong><em>{step.city}</em></span>
          </button>
        ))}
      </section>

      <footer className={styles.footer}>
        <p><span>✦</span> A gente acompanha até chegar. De verdade.</p>
        <p>Última atualização há 2 minutos</p>
      </footer>
    </main>
  );
}
