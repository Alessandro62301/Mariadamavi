import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FaqAccordion, { FaqEntry } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Perguntas frequentes | Mavi — Apple por encomenda com contrato e nota fiscal",
  description:
    "Tire suas dúvidas sobre comprar Apple com a Mavi: como funciona a encomenda, lacrado x CPO x seminovo, pagamento, prazos, segurança, garantia e entrega em todo o Brasil.",
  alternates: { canonical: "https://mariadamavi.com.br/faq" },
};

const WA = "https://wa.me/5521920184210";
const wa = (msg: string) => `${WA}?text=${encodeURIComponent(msg)}`;

type Categoria = { id: string; titulo: string; itens: FaqEntry[] };

const CATEGORIAS: Categoria[] = [
  {
    id: "sobre-a-mavi",
    titulo: "Sobre a Mavi",
    itens: [
      {
        pergunta: "A Mavi tem loja física?",
        resposta: "A Mavi fica em Niterói/RJ, mas o atendimento é 100% online. Você fala diretamente com a Maria Victória e recebe acompanhamento durante todo o processo, do orçamento até a entrega.",
      },
      {
        pergunta: "Quem é a Maria Victória?",
        resposta: "Ela conduz o atendimento da Mavi pessoalmente e acompanha cada encomenda de perto. Seu papel não é empurrar o aparelho mais caro, e sim entender o momento de cada cliente e ajudar na escolha certa. Nos bastidores, o marido dela, Junior, participa da operação e da parte estratégica.",
      },
      {
        pergunta: "A Mavi é confiável? É seguro comprar Apple importado ou por encomenda?",
        resposta: "A compra é formalizada por contrato com validade jurídica antes do pagamento, com emissão de nota fiscal e verificação de IMEI. Isso reduz o risco em relação a uma compra informal, já que existe documento assinado com as condições combinadas antes de qualquer valor ser pago.",
      },
      {
        pergunta: "A Mavi é revendedora oficial Apple?",
        resposta: "Não. A Mavi é uma operação independente. Apple e os nomes de seus produtos são marcas de seus respectivos titulares, sem vínculo oficial com a Mavi.",
      },
    ],
  },
  {
    id: "produtos",
    titulo: "Produtos",
    itens: [
      {
        pergunta: "O que significa aparelho lacrado, CPO e seminovo?",
        resposta: "Lacrado é um aparelho novo, na caixa fechada de fábrica. CPO (Certified Pre-Owned) é um usado recondicionado e certificado, com padrão próximo ao de um aparelho novo. Seminovo é um usado avaliado individualmente, com condição verificada antes da venda. A Mavi explica as diferenças aplicáveis a cada caso antes da decisão.",
      },
      {
        pergunta: "Os aparelhos estão à pronta entrega?",
        resposta: "Não. A operação funciona por encomenda. A disponibilidade e o prazo aplicáveis a cada modelo são verificados e informados no orçamento.",
      },
      {
        pergunta: "Quais categorias de produto a Mavi trabalha?",
        resposta: "iPhone, iPad e MacBook, sempre buscando a opção que combina com o uso e o orçamento de cada cliente, em vez de empurrar o modelo mais caro ou o mais novo.",
      },
      {
        pergunta: "Como funciona a garantia dos produtos?",
        resposta: "A garantia depende da categoria e da condição do produto. A informação aplicável a cada aparelho consta no orçamento e é explicada antes da compra.",
      },
    ],
  },
  {
    id: "compra-e-pagamento",
    titulo: "Compra e pagamento",
    itens: [
      {
        pergunta: "Por que o pagamento é antecipado?",
        resposta: "Como a Mavi trabalha por encomenda, o pagamento acontece depois da aprovação do orçamento e da assinatura do contrato. A partir da confirmação, a encomenda do aparelho escolhido é iniciada.",
      },
      {
        pergunta: "Quais são as formas de pagamento aceitas?",
        resposta: "Pix, cartão em até 12 vezes com acréscimo via link, ou uma combinação de Pix e cartão.",
      },
      {
        pergunta: "Como começo uma encomenda?",
        resposta: "Chamando no WhatsApp e contando qual aparelho você está procurando. A partir daí, a Mavi faz uma pergunta por vez pra te ajudar a entender as opções, até chegar num orçamento.",
      },
    ],
  },
  {
    id: "seguranca",
    titulo: "Segurança e garantia",
    itens: [
      {
        pergunta: "O que o contrato garante?",
        resposta: "O contrato de encomenda tem validade jurídica e reúne os dados do cliente, os dados da Mavi, detalhes do produto (modelo, cor, armazenamento), valores e prazos. Ele é assinado antes do pagamento, numa plataforma de assinatura eletrônica.",
      },
      {
        pergunta: "Toda compra tem nota fiscal e verificação de IMEI?",
        resposta: "Sim, em toda compra realizada pela Mavi.",
      },
      {
        pergunta: "E se eu não receber o produto?",
        resposta: "Se o produto contratado não for recebido, o valor pago é devolvido, sem discussão.",
      },
    ],
  },
  {
    id: "entrega",
    titulo: "Entrega e prazos",
    itens: [
      {
        pergunta: "Quanto tempo demora a entrega?",
        resposta: "Produtos que já estão no Brasil levam cerca de 2 dias úteis para chegar até a Mavi; produtos importados levam cerca de 7 dias úteis. Depois disso, a encomenda segue direto para a entrega no endereço do cliente, com rastreio.",
      },
      {
        pergunta: "Como funciona a entrega e o frete?",
        resposta: "A Mavi entrega para todo o Brasil com frete grátis. A modalidade é confirmada conforme o endereço: motoboy nas áreas atendidas no Rio de Janeiro e Sedex para os demais destinos. Após a confirmação, o cliente recebe rastreio e acompanhamento.",
      },
      {
        pergunta: "Em que embalagem o produto chega?",
        resposta: "Numa MaviBag, a embalagem própria da Mavi, além da caixa original do produto.",
      },
    ],
  },
  {
    id: "aparelho-usado",
    titulo: "Aparelho usado como entrada",
    itens: [
      {
        pergunta: "Posso usar meu iPhone atual como parte do pagamento?",
        resposta: "Sim. O aparelho usado pode ser avaliado e, se aprovado, o valor é abatido do novo aparelho, conforme a avaliação aplicável ao seu caso.",
      },
      {
        pergunta: "Como funciona a avaliação do meu aparelho usado?",
        resposta: "As condições de avaliação são explicadas durante o orçamento, antes de qualquer decisão.",
      },
    ],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: CATEGORIAS.flatMap((cat) =>
    cat.itens.map((item) => ({
      "@type": "Question",
      name: item.pergunta,
      acceptedAnswer: { "@type": "Answer", text: item.resposta },
    }))
  ),
};

export default function FaqPage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main id="conteudo">
        <section className="hero-faq">
          <div className="container">
            <p className="eyebrow">DÚVIDAS FREQUENTES</p>
            <h1>Tudo o que você precisa saber antes de encomendar seu Apple.</h1>
            <p className="lead">
              Reunimos aqui as perguntas mais comuns sobre como a Mavi funciona: encomenda, lacrado x CPO x seminovo, pagamento, prazos, segurança, garantia e entrega. Se faltar alguma coisa, é só chamar no WhatsApp.
            </p>
            <nav className="toc" aria-label="Categorias de perguntas">
              {CATEGORIAS.map((cat) => (
                <a key={cat.id} href={`#${cat.id}`}>{cat.titulo}</a>
              ))}
            </nav>
          </div>
        </section>

        <section>
          <div className="container">
            {CATEGORIAS.map((cat) => (
              <div className="categoria" id={cat.id} key={cat.id}>
                <div className="categoria-titulo">
                  <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{cat.titulo}</h2>
                </div>
                <FaqAccordion items={cat.itens} />
              </div>
            ))}

            <div className="cta-final" style={{ background: "var(--plum)", color: "var(--ivory)", borderRadius: 24, padding: "48px clamp(20px,5vw,64px)", marginTop: 56 }}>
              <h2 style={{ color: "var(--ivory)" }}>Ainda ficou com dúvida?</h2>
              <p style={{ color: "rgba(247,240,232,.78)", maxWidth: "60ch", marginLeft: "auto", marginRight: "auto" }}>
                Me conta o que você procura e como pretende usar. Eu te ajudo a entender qual caminho faz sentido pro seu momento — sem pressão e sem resposta genérica.
              </p>
              <a className="btn btn-primary" href={wa("Oi, Mavi! Tenho uma dúvida que não vi no FAQ.")}>
                Quero falar com a Mavi
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
