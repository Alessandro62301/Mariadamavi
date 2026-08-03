export const WHATSAPP_NUMBER = "5521999999999";

export type CategorySlug =
  | "iphones-lacrados"
  | "iphones-seminovos"
  | "macbooks"
  | "ipads"
  | "assistencia";

export type Availability =
  | "Disponivel"
  | "Sob Encomenda"
  | "Consultar Valor"
  | "Indisponivel";

export type Product = {
  slug: string;
  nome: string;
  subtitulo: string;
  categoria: string;
  categoriaSlug: CategorySlug;
  chip: string;
  precoApple: number;
  storage: string[];
  cores: string[];
  condicao: "lacrado" | "seminovo";
  disponibilidade: Availability;
  imagem: string;
  emoji: string;
  lancamento: number;
  visualizacoesHoje: number;
  garantia: string;
  anoModelo: string;
  variantes: Record<
    string,
    {
      preco: number;
      parcela12x: number;
      parcela21x: number;
    }
  >;
  especificacoes: {
    tela: string;
    chip: string;
    cameraPrincipal: string;
    cameraFrontal: string;
    bateria: string;
    faceId: string;
    cor: string;
    estado: string;
    imeiVerificavel: string;
    garantiaMavi: string;
    anoModelo: string;
  };
};

export type CartItem = {
  slug: string;
  quantidade: number;
  storage: string;
  cor: string;
};

export const categoryMeta: Record<
  CategorySlug,
  {
    titulo: string;
    subtitulo: string;
  }
> = {
  "iphones-lacrados": {
    titulo: "iPhones Lacrados",
    subtitulo: "Produtos iPhone Lacrados",
  },
  "iphones-seminovos": {
    titulo: "iPhones Seminovos",
    subtitulo: "Produtos Apple Seminovos Premium",
  },
  macbooks: {
    titulo: "MacBooks",
    subtitulo: "Modelos selecionados para trabalho e criacao",
  },
  ipads: {
    titulo: "iPads",
    subtitulo: "Tablets Apple para estudo, criacao e uso diario",
  },
  assistencia: {
    titulo: "Assistencia",
    subtitulo: "Consertos e revisoes com suporte da Mavi",
  },
};

function buildVariantPricing(basePrice: number, storages: string[]) {
  return Object.fromEntries(
    storages.map((storage, index) => {
      const increment = index * 400;
      const price = basePrice + increment;
      return [
        storage,
        {
          preco: price,
          parcela12x: Math.round(price / 10.55),
          parcela21x: Math.round(price / 17.3),
        },
      ];
    }),
  );
}

function createProduct(input: Omit<Product, "variantes"> & { basePrice: number }) {
  return {
    ...input,
    variantes: buildVariantPricing(input.basePrice, input.storage),
  };
}

export const produtos: Product[] = [
  createProduct({
    slug: "iphone-13-lacrado",
    nome: "iPhone 13 Lacrado",
    subtitulo: "Todas as cores · A15 Bionic",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A15 Bionic",
    precoApple: 4999,
    basePrice: 3897,
    storage: ["128GB", "256GB", "512GB"],
    cores: ["Preto", "Branco", "Estelar", "Todas as cores"],
    condicao: "lacrado",
    disponibilidade: "Disponivel",
    imagem: "/imgs/iphone13.svg",
    emoji: "📱",
    lancamento: 2021,
    visualizacoesHoje: 3,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2021",
    especificacoes: {
      tela: '6.1" Super Retina XDR',
      chip: "A15 Bionic",
      cameraPrincipal: "12 MP dual camera",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 19h de video",
      faceId: "Sim",
      cor: "Preto / Branco / Estelar",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2021",
    },
  }),
  createProduct({
    slug: "iphone-13-mini-lacrado",
    nome: "iPhone 13 mini Lacrado",
    subtitulo: "Compacto · A15 Bionic",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A15 Bionic",
    precoApple: 4699,
    basePrice: 3597,
    storage: ["128GB", "256GB", "512GB"],
    cores: ["Preto", "Branco", "Estelar"],
    condicao: "lacrado",
    disponibilidade: "Sob Encomenda",
    imagem: "/imgs/iphone13.svg",
    emoji: "📱",
    lancamento: 2021,
    visualizacoesHoje: 2,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2021",
    especificacoes: {
      tela: '5.4" Super Retina XDR',
      chip: "A15 Bionic",
      cameraPrincipal: "12 MP dual camera",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 17h de video",
      faceId: "Sim",
      cor: "Preto / Branco / Estelar",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2021",
    },
  }),
  createProduct({
    slug: "iphone-14-lacrado",
    nome: "iPhone 14 Lacrado",
    subtitulo: "Todas as cores · A15 Bionic",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A15 Bionic",
    precoApple: 5399,
    basePrice: 4197,
    storage: ["128GB", "256GB", "512GB"],
    cores: ["Preto", "Branco", "Meia-noite", "Estelar", "Todas as cores"],
    condicao: "lacrado",
    disponibilidade: "Disponivel",
    imagem: "/imgs/iphone14.svg",
    emoji: "📱",
    lancamento: 2022,
    visualizacoesHoje: 6,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2022",
    especificacoes: {
      tela: '6.1" Super Retina XDR',
      chip: "A15 Bionic",
      cameraPrincipal: "12 MP dual camera",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 20h de video",
      faceId: "Sim",
      cor: "Meia-noite / Branco / Estelar",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2022",
    },
  }),
  createProduct({
    slug: "iphone-14-plus-lacrado",
    nome: "iPhone 14 Plus Lacrado",
    subtitulo: "Tela maior · A15 Bionic",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A15 Bionic",
    precoApple: 6199,
    basePrice: 4697,
    storage: ["128GB", "256GB", "512GB"],
    cores: ["Preto", "Branco", "Meia-noite", "Estelar"],
    condicao: "lacrado",
    disponibilidade: "Disponivel",
    imagem: "/imgs/iphone14.svg",
    emoji: "📱",
    lancamento: 2022,
    visualizacoesHoje: 5,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2022",
    especificacoes: {
      tela: '6.7" Super Retina XDR',
      chip: "A15 Bionic",
      cameraPrincipal: "12 MP dual camera",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 26h de video",
      faceId: "Sim",
      cor: "Meia-noite / Branco / Estelar",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2022",
    },
  }),
  createProduct({
    slug: "iphone-15-lacrado",
    nome: "iPhone 15 Lacrado",
    subtitulo: "Todas as cores · A16 Bionic",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A16 Bionic",
    precoApple: 5700,
    basePrice: 4497,
    storage: ["128GB", "256GB", "512GB"],
    cores: ["Preto", "Branco", "Estelar", "Meia-noite", "Todas as cores"],
    condicao: "lacrado",
    disponibilidade: "Disponivel",
    imagem: "/imgs/iphone15.svg",
    emoji: "📱",
    lancamento: 2023,
    visualizacoesHoje: 8,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2023",
    especificacoes: {
      tela: '6.1" Super Retina XDR',
      chip: "A16 Bionic",
      cameraPrincipal: "48 MP",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 20h de video",
      faceId: "Sim",
      cor: "Preto / Branco / Estelar",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2023",
    },
  }),
  createProduct({
    slug: "iphone-15-plus-lacrado",
    nome: "iPhone 15 Plus Lacrado",
    subtitulo: "Bateria estendida · A16 Bionic",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A16 Bionic",
    precoApple: 6499,
    basePrice: 4997,
    storage: ["128GB", "256GB", "512GB"],
    cores: ["Preto", "Branco", "Estelar", "Meia-noite"],
    condicao: "lacrado",
    disponibilidade: "Consultar Valor",
    imagem: "/imgs/iphone15.svg",
    emoji: "📱",
    lancamento: 2023,
    visualizacoesHoje: 4,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2023",
    especificacoes: {
      tela: '6.7" Super Retina XDR',
      chip: "A16 Bionic",
      cameraPrincipal: "48 MP",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 26h de video",
      faceId: "Sim",
      cor: "Preto / Branco / Estelar",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2023",
    },
  }),
  createProduct({
    slug: "iphone-15-pro-lacrado",
    nome: "iPhone 15 Pro Lacrado",
    subtitulo: "Titanio · A17 Pro",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A17 Pro",
    precoApple: 8299,
    basePrice: 5897,
    storage: ["128GB", "256GB", "512GB", "1TB"],
    cores: ["Titanio Natural", "Titanio Preto", "Branco"],
    condicao: "lacrado",
    disponibilidade: "Disponivel",
    imagem: "/imgs/iphone15-pro.svg",
    emoji: "📱",
    lancamento: 2023,
    visualizacoesHoje: 10,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2023",
    especificacoes: {
      tela: '6.1" Super Retina XDR',
      chip: "A17 Pro",
      cameraPrincipal: "48 MP Pro",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 23h de video",
      faceId: "Sim",
      cor: "Titanio Natural / Titanio Preto / Branco",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2023",
    },
  }),
  createProduct({
    slug: "iphone-15-pro-max-lacrado",
    nome: "iPhone 15 Pro Max Lacrado",
    subtitulo: "Zoom optico · A17 Pro",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A17 Pro",
    precoApple: 9999,
    basePrice: 6997,
    storage: ["256GB", "512GB", "1TB"],
    cores: ["Titanio Natural", "Titanio Preto", "Prateado"],
    condicao: "lacrado",
    disponibilidade: "Sob Encomenda",
    imagem: "/imgs/iphone15-pro.svg",
    emoji: "📱",
    lancamento: 2023,
    visualizacoesHoje: 7,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2023",
    especificacoes: {
      tela: '6.7" Super Retina XDR',
      chip: "A17 Pro",
      cameraPrincipal: "48 MP Pro",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 29h de video",
      faceId: "Sim",
      cor: "Titanio Natural / Titanio Preto / Prateado",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2023",
    },
  }),
  createProduct({
    slug: "iphone-16-lacrado",
    nome: "iPhone 16 Lacrado",
    subtitulo: "Nova geracao · A18",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A18",
    precoApple: 6700,
    basePrice: 5097,
    storage: ["128GB", "256GB", "512GB"],
    cores: ["Preto", "Branco", "Estelar"],
    condicao: "lacrado",
    disponibilidade: "Disponivel",
    imagem: "/imgs/iphone16.svg",
    emoji: "📱",
    lancamento: 2024,
    visualizacoesHoje: 11,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2024",
    especificacoes: {
      tela: '6.1" Super Retina XDR',
      chip: "A18",
      cameraPrincipal: "48 MP",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 22h de video",
      faceId: "Sim",
      cor: "Preto / Branco / Estelar",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2024",
    },
  }),
  createProduct({
    slug: "iphone-16-plus-lacrado",
    nome: "iPhone 16 Plus Lacrado",
    subtitulo: "Tela grande · A18",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A18",
    precoApple: 7399,
    basePrice: 5497,
    storage: ["128GB", "256GB", "512GB"],
    cores: ["Preto", "Branco", "Estelar"],
    condicao: "lacrado",
    disponibilidade: "Disponivel",
    imagem: "/imgs/iphone16.svg",
    emoji: "📱",
    lancamento: 2024,
    visualizacoesHoje: 6,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2024",
    especificacoes: {
      tela: '6.7" Super Retina XDR',
      chip: "A18",
      cameraPrincipal: "48 MP",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 28h de video",
      faceId: "Sim",
      cor: "Preto / Branco / Estelar",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2024",
    },
  }),
  createProduct({
    slug: "iphone-16-pro-lacrado",
    nome: "iPhone 16 Pro Lacrado",
    subtitulo: "Titanio Natural · A18 Pro",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A18 Pro",
    precoApple: 8999,
    basePrice: 6497,
    storage: ["128GB", "256GB", "512GB", "1TB"],
    cores: ["Titanio Natural", "Titanio Preto", "Prateado"],
    condicao: "lacrado",
    disponibilidade: "Disponivel",
    imagem: "/imgs/iphone16-pro.svg",
    emoji: "📱",
    lancamento: 2024,
    visualizacoesHoje: 12,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2024",
    especificacoes: {
      tela: '6.3" Super Retina XDR',
      chip: "A18 Pro",
      cameraPrincipal: "48 MP Pro",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 27h de video",
      faceId: "Sim",
      cor: "Titanio Natural / Titanio Preto / Prateado",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2024",
    },
  }),
  createProduct({
    slug: "iphone-17e-lacrado",
    nome: "iPhone 17e",
    subtitulo: "Entrada premium · A19",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A19",
    precoApple: 6200,
    basePrice: 4397,
    storage: ["128GB", "256GB", "512GB"],
    cores: ["Roxo", "Branco", "Preto"],
    condicao: "lacrado",
    disponibilidade: "Disponivel",
    imagem: "/imgs/iphone17.svg",
    emoji: "📱",
    lancamento: 2025,
    visualizacoesHoje: 9,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2025",
    especificacoes: {
      tela: '6.1" Super Retina XDR',
      chip: "A19",
      cameraPrincipal: "48 MP",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 23h de video",
      faceId: "Sim",
      cor: "Roxo / Branco / Preto",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2025",
    },
  }),
  createProduct({
    slug: "iphone-17-lacrado",
    nome: "iPhone 17",
    subtitulo: "Nova linha · A19",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A19",
    precoApple: 7000,
    basePrice: 5697,
    storage: ["128GB", "256GB", "512GB"],
    cores: ["Preto", "Branco", "Estelar"],
    condicao: "lacrado",
    disponibilidade: "Disponivel",
    imagem: "/imgs/iphone17.svg",
    emoji: "📱",
    lancamento: 2025,
    visualizacoesHoje: 14,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2025",
    especificacoes: {
      tela: '6.3" Super Retina XDR',
      chip: "A19",
      cameraPrincipal: "48 MP",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 24h de video",
      faceId: "Sim",
      cor: "Preto / Branco / Estelar",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2025",
    },
  }),
  createProduct({
    slug: "iphone-17-pro-lacrado",
    nome: "iPhone 17 Pro",
    subtitulo: "Titanio Natural · A19 Pro",
    categoria: "iPhones Lacrados",
    categoriaSlug: "iphones-lacrados",
    chip: "A19 Pro",
    precoApple: 9599,
    basePrice: 7097,
    storage: ["256GB", "512GB", "1TB"],
    cores: ["Titanio Natural", "Titanio Preto", "Prateado"],
    condicao: "lacrado",
    disponibilidade: "Indisponivel",
    imagem: "/imgs/iphone17-pro.svg",
    emoji: "📱",
    lancamento: 2025,
    visualizacoesHoje: 13,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2025",
    especificacoes: {
      tela: '6.3" Super Retina XDR',
      chip: "A19 Pro",
      cameraPrincipal: "48 MP Pro",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Ate 28h de video",
      faceId: "Sim",
      cor: "Titanio Natural / Titanio Preto / Prateado",
      estado: "Novo Lacrado",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2025",
    },
  }),
  createProduct({
    slug: "iphone-14-pro-seminovo",
    nome: "iPhone 14 Pro",
    subtitulo: "Seminovo premium · A16 Bionic",
    categoria: "iPhones Seminovos",
    categoriaSlug: "iphones-seminovos",
    chip: "A16 Bionic",
    precoApple: 6299,
    basePrice: 3897,
    storage: ["128GB", "256GB"],
    cores: ["Preto", "Prateado", "Roxo"],
    condicao: "seminovo",
    disponibilidade: "Disponivel",
    imagem: "/imgs/iphone14.svg",
    emoji: "📱",
    lancamento: 2022,
    visualizacoesHoje: 5,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2022",
    especificacoes: {
      tela: '6.1" Super Retina XDR',
      chip: "A16 Bionic",
      cameraPrincipal: "48 MP Pro",
      cameraFrontal: "12 MP TrueDepth",
      bateria: "Saude acima de 88%",
      faceId: "Sim",
      cor: "Preto / Prateado / Roxo",
      estado: "Seminovo Premium",
      imeiVerificavel: "Sim, com serial verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2022",
    },
  }),
  createProduct({
    slug: "ipad-11-a16",
    nome: "iPad 11 A16",
    subtitulo: "Versatil para rotina e estudos",
    categoria: "iPads",
    categoriaSlug: "ipads",
    chip: "A16 Bionic",
    precoApple: 4499,
    basePrice: 2997,
    storage: ["64GB", "128GB", "256GB"],
    cores: ["Prateado", "Estelar"],
    condicao: "lacrado",
    disponibilidade: "Disponivel",
    imagem: "/imgs/ipad11.svg",
    emoji: "💊",
    lancamento: 2024,
    visualizacoesHoje: 4,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2024",
    especificacoes: {
      tela: '11" Liquid Retina',
      chip: "A16 Bionic",
      cameraPrincipal: "12 MP",
      cameraFrontal: "12 MP ultra wide",
      bateria: "Ate 10h",
      faceId: "Touch ID",
      cor: "Prateado / Estelar",
      estado: "Novo Lacrado",
      imeiVerificavel: "Modelo Wi-Fi",
      garantiaMavi: "6 meses",
      anoModelo: "2024",
    },
  }),
  createProduct({
    slug: "ipad-air-m3-11",
    nome: 'iPad Air M3 11"',
    subtitulo: "Criacao e produtividade",
    categoria: "iPads",
    categoriaSlug: "ipads",
    chip: "M3",
    precoApple: 7499,
    basePrice: 4597,
    storage: ["128GB", "256GB", "512GB"],
    cores: ["Prateado", "Estelar", "Meia-noite"],
    condicao: "lacrado",
    disponibilidade: "Sob Encomenda",
    imagem: "/imgs/ipadairm3.svg",
    emoji: "💊",
    lancamento: 2025,
    visualizacoesHoje: 4,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2025",
    especificacoes: {
      tela: '11" Liquid Retina',
      chip: "M3",
      cameraPrincipal: "12 MP",
      cameraFrontal: "12 MP horizontal",
      bateria: "Ate 10h",
      faceId: "Touch ID",
      cor: "Prateado / Estelar / Meia-noite",
      estado: "Novo Lacrado",
      imeiVerificavel: "Modelo Wi-Fi",
      garantiaMavi: "6 meses",
      anoModelo: "2025",
    },
  }),
  createProduct({
    slug: "macbook-air-m3",
    nome: "MacBook Air M3",
    subtitulo: "Leve e rapido para trabalho",
    categoria: "MacBooks",
    categoriaSlug: "macbooks",
    chip: "M3",
    precoApple: 12499,
    basePrice: 8297,
    storage: ["256GB", "512GB", "1TB"],
    cores: ["Prateado", "Estelar", "Meia-noite"],
    condicao: "lacrado",
    disponibilidade: "Sob Encomenda",
    imagem: "/imgs/macbook-air.svg",
    emoji: "💻",
    lancamento: 2024,
    visualizacoesHoje: 2,
    garantia: "6 meses de garantia funcional",
    anoModelo: "2024",
    especificacoes: {
      tela: '13.6" Liquid Retina',
      chip: "M3",
      cameraPrincipal: "1080p FaceTime HD",
      cameraFrontal: "1080p FaceTime HD",
      bateria: "Ate 18h",
      faceId: "Touch ID",
      cor: "Prateado / Estelar / Meia-noite",
      estado: "Novo Lacrado",
      imeiVerificavel: "Numero de serie verificavel",
      garantiaMavi: "6 meses",
      anoModelo: "2024",
    },
  }),
];

export const categoryFilters = {
  categorias: [
    { label: "iPhones Lacrados", value: "iphones-lacrados" },
    { label: "iPhones Seminovos", value: "iphones-seminovos" },
    { label: "MacBooks", value: "macbooks" },
    { label: "iPads", value: "ipads" },
    { label: "Assistencia", value: "assistencia" },
  ],
  condicoes: ["Novo Lacrado", "Seminovo"],
  disponibilidade: ["Disponivel", "Sob Encomenda", "Consultar Valor", "Indisponivel"],
  armazenamento: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  cores: [
    "Preto",
    "Branco",
    "Prateado",
    "Estelar",
    "Meia-noite",
    "Titanio Natural",
    "Titanio Preto",
    "Todas as cores",
  ],
};

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR");
}

export function getFirstStorage(product: Product) {
  return product.storage[0];
}

export function getVariant(product: Product, storage: string) {
  return product.variantes[storage] ?? product.variantes[getFirstStorage(product)];
}

export function getProductBySlug(slug: string) {
  return produtos.find((product) => product.slug === slug);
}

export function getProductsByCategory(categorySlug: CategorySlug) {
  return produtos.filter((product) => product.categoriaSlug === categorySlug);
}

export function getSavings(product: Product, storage: string) {
  return Math.max(product.precoApple - getVariant(product, storage).preco, 0);
}

export function createProductWhatsAppMessage(product: Product, storage: string, color: string) {
  return `Ola! Tenho interesse no ${product.nome} (${storage}, ${color}). Pode me passar mais detalhes?`;
}

export function createCartWhatsAppMessage(items: CartItem[]) {
  const lines = items.map((item) => {
    const product = getProductBySlug(item.slug);
    if (!product) {
      return "";
    }

    const variant = getVariant(product, item.storage);
    return `📱 ${product.nome}\n💾 ${item.storage} · ${item.cor}\n💰 Total: R$ ${formatPrice(variant.preco * item.quantidade)}`;
  });

  return `Ola! Quero fechar pedido:\n\n${lines.filter(Boolean).join("\n\n")}\n\nPode confirmar disponibilidade?`;
}

export function createWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
