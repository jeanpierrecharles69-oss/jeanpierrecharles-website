export interface BlogArticle {
  id: string;
  publishDate: string;
  author: string;
  tags: string[];
  readingTime: number;
  fr: {
    title: string;
    subtitle: string;
    metaDescription: string;
    content: string;
  };
  en: {
    title: string;
    subtitle: string;
    metaDescription: string;
    content: string;
  };
}

export const blogArticles: BlogArticle[] = [
  {
    id: "cra-ai-act-reglements-meres-industrie-5",
    publishDate: "2026-03-13",
    author: "Jean-Pierre Charles",
    tags: ["AI Act", "CRA", "Industrie 5.0", "PME", "Compliance"],
    readingTime: 7,
    fr: {
      title: "AI Act + CRA : les reglements-meres de l'Industrie 5.0",
      subtitle:
        "Pourquoi la convergence reglementaire europeenne est le plus puissant levier de transformation industrielle depuis le marquage CE",
      metaDescription:
        "Comment l'EU AI Act et le CRA deviennent les fondations dont decoulent Machinery CE, ESPR, NIS2, Battery Reg pour les PME industrielles EU.",
      content: "CONTENU_A_INSERER",
    },
    en: {
      title: "AI Act + CRA: the parent regulations of Industry 5.0",
      subtitle:
        "Why European regulatory convergence is the most powerful lever for industrial transformation since CE marking",
      metaDescription:
        "How the EU AI Act and CRA become the foundations from which Machinery CE, ESPR, NIS2, Battery Reg cascade down for industrial SMEs.",
      content: "CONTENU_A_INSERER",
    },
  },
];
