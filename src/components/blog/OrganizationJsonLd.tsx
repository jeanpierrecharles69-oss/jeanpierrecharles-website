import { Helmet } from "react-helmet-async";

export default function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AEGIS Intelligence",
    url: "https://aegis-intelligence.com",
    description:
      "Expert R&D compliance pour PME industrielles europeennes — AI Act, CRA, Machinery, ESPR, NIS2, Battery Regulation",
    founder: {
      "@type": "Person",
      name: "Jean-Pierre Charles",
      jobTitle: "R&D Expert",
      knowsAbout: [
        "EU AI Act",
        "Cyber Resilience Act",
        "Machinery Regulation",
        "Battery Regulation",
        "ESPR",
        "NIS2",
      ],
    },
    areaServed: "EU",
    knowsAbout: [
      "EU AI Act",
      "Cyber Resilience Act",
      "Machinery Regulation",
      "Battery Regulation",
      "ESPR",
      "NIS2",
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
