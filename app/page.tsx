import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import FaqAccordion from "@/components/FaqAccordion";
import Link from "next/link";

const WA = "https://wa.me/5521920184210";
const wa = (msg: string) => `${WA}?text=${encodeURIComponent(msg)}`;

const HOME_FAQ = [
  {
    pergunta: "A Mavi tem loja física?",
    resposta:
      "A Mavi fica em Niterói/RJ, mas o atendimento é 100% online. Você fala diretamente com a Maria Victória e recebe acompanhamento durante o processo.",
  },
  {
    pergunta: "Os aparelhos estão à pronta entrega?",
    resposta:
      "Não. A operação funciona por encomenda. A disponibilidade e o prazo aplicáveis são verificados e informados no orçamento.",
  },
  {
    pergunta: "Por que o pagamento é antecipado?",
    resposta:
      "Como trabalhamos por encomenda, o pagamento acontece depois da aprovação do orçamento e da assinatura do contrato. A partir da confirmação, seguimos com a encomenda do aparelho escolhido.",
  },
  {
    pergunta: "Quais são as formas de pagamento?",
    resposta: "Pix, cartão em até 12 vezes com acréscimo via link ou uma combinação de Pix e cartão.",
  },
  {
    pergunta: "Vocês trabalham com aparelhos lacrados e seminovos?",
    resposta:
      "Sim. A Mavi pode apresentar opções lacradas, CPO e seminovas e explicar as diferenças aplicáveis antes da decisão.",
  },
  {
    pergunta: "Como funciona a garantia?",
    resposta:
      "A garantia depende da categoria e da condição do produto. A informação aplicável deve constar no orçamento e ser explicada antes da compra.",
  },
  {
    pergunta: "Como funciona a entrega?",
    resposta:
      "Entregamos para todo o Brasil com frete grátis. A modalidade é confirmada conforme o endereço: motoboy nas áreas atendidas no Rio de Janeiro e Sedex para os demais destinos. Após a confirmação, você recebe rastreio e acompanhamento.",
  },
  {
    pergunta: "Posso usar meu iPhone atual como entrada?",
    resposta: "Sim. O aparelho pode ser avaliado e, se aprovado, o valor é abatido do novo. As condições são explicadas durante o orçamento.",
  },
  {
    pergunta: "Como começo?",
    resposta:
      "Me chama no WhatsApp e me conta qual aparelho você está procurando. A partir daí, eu faço uma pergunta por vez e te ajudo a entender as opções.",
  },
];

const TIMELINE = [
  { titulo: "Contato inicial", texto: "Você me chama contando o que procura e como pretende usar.", emoji: "💬", legenda: "print da conversa" },
  { titulo: "Formulário", texto: "Você preenche modelo, cor, armazenamento e endereço de entrega.", emoji: "📝", legenda: "print do formulário" },
  { titulo: "Contrato", texto: "Preparamos o contrato com as condições combinadas: modelo, cor, valor e prazo.", emoji: "📄", legenda: "print do contrato" },
  { titulo: "Assinatura digital", texto: "O contrato é assinado numa plataforma de assinatura eletrônica, com validade jurídica.", emoji: "✍️", legenda: "assinatura concluída" },
  { titulo: "Pagamento", texto: "Só depois do contrato assinado o pagamento é feito, via Pix ou cartão.", emoji: "💳", legenda: "comprovante do pagamento" },
  { titulo: "Chegada até nós", texto: "Produtos que já estão no Brasil levam 2 dias úteis; produtos importados, 7 dias úteis.", emoji: "📦", legenda: "conferência do produto" },
  { titulo: "Entrega", texto: "Você recebe na sua MaviBag, com rastreio e acompanhamento até a porta.", emoji: "🛍️", legenda: "sua MaviBag chegando" },
];

export default function HomePage() {
  return (
    <>
      <Reveal />
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <SiteHeader />

      <main id="conteudo">
        {/* HERO */}
        <section className="hero" id="topo">
          <div className="container">
            <div className="hero-grid">
              <div className="reveal">
                <p className="eyebrow">APPLE PARA A VIDA REAL</p>
                <h1>Seu próximo Apple não precisa ser uma escolha no escuro.</h1>
                <p className="lead">
                  Eu te ajudo a comparar opções lacradas, CPO e seminovas, entender o que faz sentido pro seu uso e acompanhar cada etapa até a entrega.
                </p>
                <div className="hero-ctas">
                  <a className="btn btn-primary" href={wa("Oi, Mavi! Vim pelo site e quero ajuda para escolher meu próximo Apple.")}>
                    Quero escolher meu Apple
                  </a>
                  <a className="btn btn-secondary" href="#como-funciona">Ver como funciona</a>
                </div>
              </div>
              <figure className="reveal" style={{ transitionDelay: "120ms" }}>
                <div className="img-slot" style={{ padding: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/imgs/maria-victoria-perfil.jpg"
                    alt="Maria Victória, à frente da Mavi."
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-img)" }}
                  />
                </div>
                <figcaption>Maria Victória, à frente da Mavi.</figcaption>
              </figure>
            </div>

            <div className="evidence-strip">
              <div className="evidence-item">
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Atendimento pessoal
              </div>
              <div className="evidence-item">
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
                Contrato
              </div>
              <div className="evidence-item">
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16v12H4z" /><path d="M8 6v12M4 10h4M4 15h4" /></svg>
                Nota fiscal
              </div>
              <div className="evidence-item">
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 12h13l4 4v3h-3M3 12V6h13v6" /><circle cx="7.5" cy="19" r="1.6" /><circle cx="16.5" cy="19" r="1.6" /></svg>
                Entrega em todo o Brasil
              </div>
            </div>
          </div>
        </section>

        {/* RECONHECIMENTO */}
        <section id="problema">
          <div className="container">
            <h2>Comprar tecnologia deveria organizar sua vida, não criar outra preocupação.</h2>
            <p className="lead">
              Entre modelos, configurações, preços e promessas, é fácil ficar sem saber o que vale a pena. Você não precisa entender de tudo pra fazer uma escolha consciente. Precisa de clareza, orientação e um processo que não esconda etapa nenhuma.
            </p>
            <p className="destaque">O mais caro nem sempre é o mais adequado. E o mais barato pode não atender ao que você precisa.</p>
            <div className="grid-3">
              <div className="card reveal" style={{ transitionDelay: "0ms" }}>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>
                <h3>Escolher sem entender</h3>
                <p>O modelo certo depende do seu uso, não do que está em promoção.</p>
              </div>
              <div className="card reveal" style={{ transitionDelay: "100ms" }}>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <h3>Comprar sem saber com quem contar</h3>
                <p>Numa operação online, transparência e acompanhamento não são detalhe. São parte da decisão.</p>
              </div>
              <div className="card reveal" style={{ transitionDelay: "200ms" }}>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 12h13l4 4v3h-3M3 12V6h13v6" /><circle cx="7.5" cy="19" r="1.6" /><circle cx="16.5" cy="19" r="1.6" /></svg>
                <h3>Ficar sozinha depois do pagamento</h3>
                <p>A experiência não termina quando o Pix cai. Ela continua até você receber.</p>
              </div>
            </div>
          </div>
        </section>

        {/* GUIA */}
        <section className="section-plum" id="guia">
          <div className="container">
            <div className="guia-grid">
              <figure>
                <div
                  className="img-slot"
                  style={{ background: "linear-gradient(160deg,#4a2a40,#3B2033)", borderColor: "rgba(247,240,232,.35)" }}
                  role="img"
                  aria-label="Maria Victória em atendimento, foto real"
                >
                  <span style={{ color: "rgba(247,240,232,.75)" }}>📷 Maria Victória em atendimento</span>
                </div>
              </figure>
              <div>
                <p className="eyebrow">TEM GENTE DE VERDADE AQUI</p>
                <h2>Oi, eu sou a Maria Victória.</h2>
                <p className="lead">
                  Eu conduzo o atendimento da Mavi e acompanho cada encomenda de perto. Meu papel não é empurrar o aparelho mais caro, e sim entender seu momento, explicar as opções e te ajudar a escolher com mais tranquilidade.
                </p>
                <p className="lead">
                  Nos bastidores, meu marido, Junior, participa comigo da operação e da parte estratégica. Você sempre sabe com quem está falando e em qual etapa está.
                </p>
                <p className="destaque on-plum">Não é sobre o aparelho mais caro. É sobre o certo para você.</p>
                <a className="btn btn-primary" href={wa("Oi, Mavi! Vim pelo site e quero ajuda para escolher meu próximo Apple.")}>
                  Conversar com a Maria Victória
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona">
          <div className="container">
            <h2 className="center">Um caminho simples, explicado antes de você decidir.</h2>
            <p className="lead center" style={{ maxWidth: "60ch" }}>
              Do primeiro contato até o aparelho chegar na sua casa: cada etapa explicada antes de você precisar perguntar.
            </p>
            <div className="timeline">
              {TIMELINE.map((step, i) => (
                <div className="tl-item reveal" style={{ transitionDelay: `${i * 60}ms` }} key={step.titulo}>
                  <div className="tl-dot">{i + 1}</div>
                  <div className="tl-content">
                    <h3>{step.titulo}</h3>
                    <p>{step.texto}</p>
                    <div className="tl-thumb" role="img" aria-label={`[SUBSTITUIR: ${step.legenda}]`}>
                      {step.emoji}
                      <span>{step.legenda}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="center" style={{ marginTop: 12 }}>
              <a className="btn btn-primary" href={wa("Oi, Mavi! Vim pelo site e quero ajuda para escolher meu próximo Apple.")}>
                Começar pelo que eu preciso
              </a>
            </div>
          </div>
        </section>

        {/* PRODUTOS */}
        <section id="produtos" className="section-plum">
          <div className="container">
            <p className="eyebrow">ESCOLHA CONSCIENTE</p>
            <h2>Tecnologia pra viver, trabalhar e crescer com mais estrutura.</h2>
            <p className="lead">Em vez de começar pelo preço ou pelo modelo mais novo, a gente começa pelo que o aparelho precisa fazer por você.</p>
            <div className="grid-3">
              {[
                { nome: "iPhone", texto: "Comunicação, criação, trabalho e rotina." },
                { nome: "iPad", texto: "Estudo, organização, leitura e mobilidade." },
                { nome: "MacBook", texto: "Produtividade, estudo e trabalho com mais estrutura." },
              ].map((p, i) => (
                <div className="card reveal" style={{ transitionDelay: `${i * 100}ms` }} key={p.nome}>
                  <div style={{ aspectRatio: "4/3", borderRadius: 8, background: "rgba(247,240,232,.08)", display: "grid", placeItems: "center", color: "rgba(247,240,232,.6)", fontSize: ".8rem", marginBottom: 14 }}>
                    📷 {p.nome}
                  </div>
                  <h3 style={{ color: "var(--ivory)" }}>{p.nome}</h3>
                  <p>{p.texto}</p>
                </div>
              ))}
            </div>
            <p className="nota-categoria" style={{ color: "rgba(247,240,232,.6)" }}>
              As opções e condições são verificadas no momento do orçamento. A Mavi trabalha por encomenda.
            </p>
            <div style={{ marginTop: 20 }}>
              <a className="btn btn-primary" href={wa("Oi, Mavi! Vim pelo site e quero comparar opções de [iPhone/iPad/MacBook].")}>
                Quero comparar opções
              </a>
            </div>
          </div>
        </section>

        {/* SEGURANÇA */}
        <section id="seguranca">
          <div className="container">
            <p className="eyebrow">CLAREZA EM CADA ETAPA</p>
            <h2>Comprar online pede processo, não promessa vazia.</h2>
            <p className="lead">A Mavi é uma operação 100% online, baseada em Niterói/RJ. Por isso, você entende como a compra funciona antes de pagar qualquer coisa.</p>
            <ul className="ico-list">
              <li>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
                <span><b>Contrato antes do pagamento.</b> A encomenda é formalizada com validade jurídica.</span>
              </li>
              <li>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16v12H4z" /><path d="M8 6v12M4 10h4M4 15h4" /></svg>
                <span><b>Nota fiscal e IMEI verificado.</b> Em toda compra.</span>
              </li>
              <li>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3v18M8 7h6a2 2 0 010 4H9a2 2 0 000 4h7" /></svg>
                <span><b>Pagamento explicado.</b> Pix, cartão em até 12x com acréscimo via link, ou combinação dos dois.</span>
              </li>
              <li>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 12h13l4 4v3h-3M3 12V6h13v6" /><circle cx="7.5" cy="19" r="1.6" /><circle cx="16.5" cy="19" r="1.6" /></svg>
                <span><b>Entrega acompanhada.</b> Frete grátis pro Brasil todo; motoboy no Rio, Sedex pros demais destinos.</span>
              </li>
              <li>
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                <span><b>Prazo até chegar até nós.</b> Produtos já no Brasil: 2 dias úteis. Produtos importados: 7 dias úteis. Depois, seguimos direto pra sua entrega.</span>
              </li>
            </ul>
            <p className="destaque" style={{ fontSize: "clamp(1.3rem,4vw,1.9rem)" }}>Não recebeu o que contratou? Seu dinheiro volta, sem discussão.</p>
            <a className="btn btn-secondary" href={wa("Oi, Mavi! Vim pelo site e tenho uma dúvida sobre o processo de encomenda.")}>
              Tirar uma dúvida sobre o processo
            </a>
          </div>
        </section>

        {/* APARELHO COMO ENTRADA */}
        <section id="entrada">
          <div className="container" style={{ maxWidth: 820 }}>
            <h2>Seu aparelho atual pode ajudar no próximo passo.</h2>
            <div className="callout">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M3 9l-1 3 1 3M21 9l1 3-1 3" /></svg>
              <p>Seu iPhone usado pode ser avaliado como parte do pagamento. O valor aprovado é abatido do novo aparelho, conforme a avaliação do seu caso.</p>
            </div>
            <a className="btn btn-primary" href={wa("Oi, Mavi! Vim pelo site e quero entender como avaliar meu iPhone como parte do pagamento.")}>
              Quero avaliar meu aparelho
            </a>
          </div>
        </section>

        {/* PROVAS REAIS */}
        <section id="provas" className="section-plum">
          <div className="container">
            <p className="eyebrow">DA CONVERSA À ENTREGA</p>
            <h2>Confiança se constrói mostrando o processo.</h2>
            <p className="lead">Aqui entram bastidores reais, entregas e feedbacks autorizados, cada um preservando nome, documento, endereço e código de rastreio.</p>
            <p className="destaque on-plum" style={{ fontSize: "clamp(1.3rem,4vw,1.9rem)" }}>
              Sua encomenda chega numa MaviBag. O momento de abrir também faz parte da experiência.
            </p>
            <div className="provas-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="prova-card reveal" key={i}>
                  <div className="prova-img" role="img" aria-label="[SUBSTITUIR: foto real do cliente com o produto recebido]">
                    📷 [foto do cliente]
                  </div>
                  <div className="prova-info">
                    <p className="prova-nome">[Nome do cliente]</p>
                    <p className="prova-handle">[@instagram]</p>
                    <p className="prova-produto">[Produto comprado]</p>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: ".85rem", color: "rgba(247,240,232,.6)" }}>
              Estrutura pronta pro padrão de prova social — trocar cada slot por um caso real aprovado (foto, @instagram e produto). Não publicar nenhum card sem autorização do cliente.
            </p>
            <a className="btn btn-on-plum" href="#" style={{ border: "1.5px solid var(--ivory)" }}>Ver mais bastidores no Instagram</a>
          </div>
        </section>

        {/* FAQ resumido */}
        <section id="duvidas">
          <div className="container" style={{ maxWidth: 780 }}>
            <h2 className="center">Perguntas frequentes</h2>
            <FaqAccordion items={HOME_FAQ} />
            <p className="center" style={{ marginTop: 24 }}>
              <Link href="/faq" style={{ fontWeight: 700, color: "var(--plum)", textDecoration: "underline" }}>
                Ver todas as perguntas frequentes →
              </Link>
            </p>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="section-plum">
          <div className="container center cta-final" style={{ maxWidth: 680 }}>
            <p className="eyebrow" style={{ color: "var(--pink)" }}>SEU PRÓXIMO PASSO</p>
            <h2>Seu próximo Apple pode começar com uma conversa simples.</h2>
            <p className="lead center">Me conta o que você procura e como pretende usar. Eu te ajudo a comparar as opções e entender qual caminho faz sentido pro seu momento.</p>
            <a className="btn btn-primary" href={wa("Oi, Mavi! Vim pelo site e quero contar o que estou procurando.")}>
              Quero falar com a Mavi
            </a>
            <p className="micro">Sem pressão e sem resposta genérica. Primeiro, eu entendo o que você precisa.</p>
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppBubble />
    </>
  );
}
