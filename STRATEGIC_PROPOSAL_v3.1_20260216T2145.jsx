import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// STRATEGIC PROPOSAL — AEGIS CIRCULAR v3.1
// "Expertise Industrielle Stratégique as a Service"
// 20260216T2145 — Claude Opus → AG Execution Brief
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#f8fafc",
  surface: "#ffffff",
  glassBg: "rgba(255,255,255,0.72)",
  glassBlur: "blur(16px)",
  glassBorder: "rgba(0,0,0,0.06)",
  text: "#1e293b",
  textDim: "#64748b",
  accent: "#2563eb",
  accentLight: "#dbeafe",
  amber: "#d97706",
  amberLight: "#fef3c7",
  green: "#16a34a",
  greenLight: "#dcfce7",
  red: "#dc2626",
  redLight: "#fee2e2",
  purple: "#7c3aed",
  purpleLight: "#ede9fe",
  shadowSm: "0 1px 3px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.08)",
  shadowLg: "0 8px 30px rgba(0,0,0,0.12)",
  border: "rgba(0,0,0,0.06)",
};

const glass = {
  background: C.glassBg,
  backdropFilter: C.glassBlur,
  WebkitBackdropFilter: C.glassBlur,
  border: `1px solid ${C.glassBorder}`,
  borderRadius: 16,
};

function Badge({ color, bg, children }) {
  return (
    <span style={{ display:"inline-block", fontSize:10, fontWeight:700, color, background:bg, padding:"3px 10px", borderRadius:20, letterSpacing:0.5 }}>
      {children}
    </span>
  );
}

function Section({ title, badge, badgeColor, badgeBg, children }) {
  return (
    <div style={{ ...glass, padding:24, marginBottom:16, boxShadow:C.shadowMd }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text }}>{title}</h2>
        {badge && <Badge color={badgeColor||"#fff"} bg={badgeBg||C.accent}>{badge}</Badge>}
      </div>
      {children}
    </div>
  );
}

function Item({ icon, title, desc, status, statusColor }) {
  return (
    <div style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
      <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{title}</div>
        <div style={{ fontSize:12, color:C.textDim, lineHeight:1.5, marginTop:2 }}>{desc}</div>
      </div>
      {status && <Badge color={statusColor||C.green} bg={statusColor=== C.red ? C.redLight : statusColor===C.amber ? C.amberLight : C.greenLight}>{status}</Badge>}
    </div>
  );
}

export default function StrategicProposal() {
  const [tab, setTab] = useState("vision");

  const tabs = [
    { id: "vision", label: "Vision Stratégique" },
    { id: "architecture", label: "Architecture Fusion" },
    { id: "nico", label: "Feedback Nico" },
    { id: "sections", label: "Sections Homepage" },
    { id: "execution", label: "Brief AG" },
  ];

  return (
    <div style={{ fontFamily:"'Inter', system-ui, sans-serif", maxWidth:920, margin:"0 auto", padding:20, background:C.bg, minHeight:"100vh" }}>

      {/* ═══ HEADER ═══ */}
      <div style={{
        background:"linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e40af 100%)",
        borderRadius:20, padding:"32px 28px", marginBottom:24, color:"#fff",
        boxShadow:"0 8px 32px rgba(37,99,235,0.3)",
      }}>
        <div style={{ fontSize:10, letterSpacing:3, opacity:0.6, marginBottom:8 }}>
          PROPOSITION STRATÉGIQUE — 20260216T2145
        </div>
        <h1 style={{ margin:0, fontSize:26, fontWeight:800, lineHeight:1.2 }}>
          Expertise Industrielle Stratégique
          <br />
          <span style={{ color:"#93c5fd" }}>as a Service</span>
        </h1>
        <div style={{ fontSize:13, opacity:0.8, marginTop:12, lineHeight:1.6 }}>
          Fusion v2.6 (Brain IA) + v3.0 (Marketing Light/Glass) + Feedback Nico
          <br />
          Cible : TPE · PME · ETI industrielles européennes — 27 États + DOM-TOM
        </div>
        <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
          <Badge color="#1e3a5f" bg="#93c5fd">CLAUDE OPUS → AG BRIEF</Badge>
          <Badge color="#92400e" bg="#fde68a">DEADLINE 27 FÉV 2026</Badge>
          <Badge color="#166534" bg="#bbf7d0">OBJECTIF &lt;10K€ MARS</Badge>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div style={{ display:"flex", gap:4, marginBottom:20, flexWrap:"wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"8px 16px", borderRadius:10, border:"none", cursor:"pointer",
            fontSize:12, fontWeight:700, transition:"all 0.2s",
            background: tab===t.id ? C.accent : C.surface,
            color: tab===t.id ? "#fff" : C.textDim,
            boxShadow: tab===t.id ? "0 2px 8px rgba(37,99,235,0.3)" : C.shadowSm,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 1 — VISION STRATÉGIQUE                        */}
      {/* ═══════════════════════════════════════════════════ */}
      {tab === "vision" && (
        <div>
          <Section title="Le Constat" badge="DIAGNOSTIC" badgeBg={C.red}>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.8 }}>
              <p style={{margin:"0 0 12px"}}>
                <strong>Deux sites coexistent sans pont entre eux.</strong> La production (jeanpierrecharles.com) est un site personnel + dashboard SaaS en Dark theme avec l'Assistant IA Aegis fonctionnel. Le localhost est une landing page marketing en Light/Glass sans aucune fonctionnalité SaaS.
              </p>
              <p style={{margin:"0 0 12px"}}>
                Le Brain IA — le composant le plus différenciant (8 règlements EU, chat Gemini streaming, base de connaissances réglementaires) — sera <strong style={{color:C.red}}>tué au prochain git push</strong> car App.tsx ne l'importe plus.
              </p>
              <p style={{margin:0}}>
                Le feedback de Nico (10/02) confirme : le site actuel est un CV, pas une offre commerciale. <em>"Que leur apportes-tu ? Efficacité ? Rentabilité ? Combien ?"</em>
              </p>
            </div>
          </Section>

          <Section title="La Vision : EISaaS" badge="PROPOSITION" badgeBg={C.green}>
            <div style={{
              background:"linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
              borderRadius:14, padding:20, marginBottom:16,
              border:"1px solid rgba(37,99,235,0.1)",
            }}>
              <div style={{ fontSize:15, fontWeight:800, color:C.accent, marginBottom:8 }}>
                Expertise Industrielle Stratégique as a Service
              </div>
              <div style={{ fontSize:13, color:C.text, lineHeight:1.7 }}>
                Un ingénieur R&D sénior de 32 ans d'expérience, amplifié par l'intelligence artificielle réglementaire, qui pilote votre conformité EU de la conception à l'industrialisation.
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {[
                { icon:"👨‍🔬", title:"L'Expert", desc:"32 ans R&D, 6 groupes, 50+ programmes véhicules. Il a conçu les produits que vous fabriquez.", color:C.accent },
                { icon:"🧠", title:"Le Brain IA", desc:"8 règlements EU, Gemini streaming, analyse d'impact en <30s, base de connaissances réglementaires.", color:C.purple },
                { icon:"🎯", title:"La Méthode", desc:"AMDEC réglementaire, convergence produit-process-conformité, feuille de route industrialisation.", color:C.green },
              ].map((item,i) => (
                <div key={i} style={{ ...glass, padding:16, textAlign:"center" }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{item.icon}</div>
                  <div style={{ fontSize:13, fontWeight:800, color:item.color, marginBottom:6 }}>{item.title}</div>
                  <div style={{ fontSize:11, color:C.textDim, lineHeight:1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:16, padding:14, background:C.amberLight, borderRadius:10, border:`1px solid ${C.amber}22` }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.amber, marginBottom:4 }}>💡 Positionnement différenciant vs concurrents</div>
              <div style={{ fontSize:11, color:C.text, lineHeight:1.7 }}>
                Les cabinets de conseil facturent 500-2000€/jour sans connaître vos process. Les outils IA génériques (ChatGPT, Perplexity) n'ont pas la culture R&D mécatronique. <strong>Aegis combine les deux</strong> : l'expertise terrain d'un ingénieur qui a industrialisé des volants airbag Toyota, des batteries TGV 1500V et des bus électriques ZEN — démultipliée par une IA spécialisée en conformité EU.
              </div>
            </div>
          </Section>

          <Section title="Métriques ROI Client" badge="NICO #4" badgeBg={C.amber}>
            <div style={{ fontSize:12, color:C.textDim, marginBottom:12 }}>
              Réponse directe à Nico : "Que leur apportes-tu ? Efficacité ? Rentabilité ? Combien ?"
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
              {[
                { metric:"<30s", label:"Analyse d'impact réglementaire", sub:"vs 2-4 semaines cabinet", color:C.accent },
                { metric:"-70%", label:"Coût veille réglementaire", sub:"50€/mois vs 1500€/jour", color:C.green },
                { metric:"0", label:"Non-conformité en production", sub:"Anticipée dès la conception", color:C.purple },
                { metric:"27+", label:"États EU couverts", sub:"+ DOM-TOM, Canaries, Açores", color:C.amber },
              ].map((m,i) => (
                <div key={i} style={{ ...glass, padding:14, textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:900, color:m.color }}>{m.metric}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:C.text, marginTop:4 }}>{m.label}</div>
                  <div style={{ fontSize:9, color:C.textDim, marginTop:2 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 2 — ARCHITECTURE FUSION                       */}
      {/* ═══════════════════════════════════════════════════ */}
      {tab === "architecture" && (
        <div>
          <Section title="Principe de Fusion" badge="ARCHITECTURE" badgeBg={C.purple}>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.8, marginBottom:16 }}>
              <strong>Pas de réécriture.</strong> On prend la base v3.0-alpha (Light/Glass, marketing, i18n FR/EN) et on y <strong>réintègre</strong> les composants fonctionnels v2.6 dans le nouveau design system. Le résultat est une homepage unique qui vend l'expertise ET démontre le produit.
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 40px 1fr 40px 1fr", gap:0, alignItems:"center" }}>
              {/* V2.6 */}
              <div style={{ background:C.redLight, borderRadius:12, padding:14, border:`2px solid ${C.red}33` }}>
                <div style={{ fontSize:11, fontWeight:800, color:C.red, marginBottom:6 }}>v2.6 PRODUCTION</div>
                <div style={{ fontSize:10, color:C.text, lineHeight:1.6 }}>
                  ✅ AegisInline.tsx (Brain IA)<br/>
                  ✅ AiAssistant.tsx (Chat UI)<br/>
                  ✅ geminiService.ts (Proxy)<br/>
                  ✅ regulationKnowledge.ts<br/>
                  ✅ Dashboard.tsx<br/>
                  ✅ CookieBanner.tsx (RGPD)<br/>
                  ✅ GamificationBadges.tsx<br/>
                  ❌ Dark theme obsolète<br/>
                  ❌ CV-centric (Nico)<br/>
                  ❌ Pas de pricing tiers
                </div>
              </div>

              <div style={{ textAlign:"center", fontSize:24 }}>→</div>

              {/* FUSION */}
              <div style={{ background:"linear-gradient(135deg, #dbeafe, #dcfce7)", borderRadius:12, padding:14, border:`2px solid ${C.accent}44`, boxShadow:C.shadowMd }}>
                <div style={{ fontSize:11, fontWeight:800, color:C.accent, marginBottom:6 }}>v3.1 FUSION ⭐</div>
                <div style={{ fontSize:10, color:C.text, lineHeight:1.6 }}>
                  🎨 Light/Glass design system<br/>
                  📝 i18n FR/EN complet<br/>
                  🧠 Brain IA intégré in-page<br/>
                  💰 Pricing 3 tiers<br/>
                  📊 Dashboard preview live<br/>
                  🔒 Cookie banner RGPD<br/>
                  🎯 ROI metrics (Nico)<br/>
                  📸 Photo JP (nouvelle)<br/>
                  🔗 React Router (SPA)
                </div>
              </div>

              <div style={{ textAlign:"center", fontSize:24 }}>←</div>

              {/* V3.0 */}
              <div style={{ background:C.accentLight, borderRadius:12, padding:14, border:`2px solid ${C.accent}33` }}>
                <div style={{ fontSize:11, fontWeight:800, color:C.accent, marginBottom:6 }}>v3.0 WIREFRAME</div>
                <div style={{ fontSize:10, color:C.text, lineHeight:1.6 }}>
                  ✅ Light/Glass tokens<br/>
                  ✅ Inter font + shadows<br/>
                  ✅ Hero marketing<br/>
                  ✅ Trust badges (5)<br/>
                  ✅ Parcours R&D timeline<br/>
                  ✅ Sans/Avec Aegis<br/>
                  ✅ Services 3 tiers<br/>
                  ✅ Pricing 0€/50€/500€<br/>
                  ✅ 8 réglements cards<br/>
                  ❌ Aucun Brain IA<br/>
                  ❌ Pas de cookie banner
                </div>
              </div>
            </div>
          </Section>

          <Section title="Fichiers Fusion — Mapping Précis" badge="AG EXECUTION" badgeBg={C.amber}>
            <div style={{ fontSize:11, color:C.textDim, marginBottom:12 }}>
              Chaque fichier source → destination dans l'architecture v3.1
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
              <thead>
                <tr style={{ background:C.accentLight }}>
                  <th style={{ padding:"8px 10px", textAlign:"left", fontWeight:700, borderRadius:"8px 0 0 0" }}>Source</th>
                  <th style={{ padding:"8px 10px", textAlign:"left", fontWeight:700 }}>Action</th>
                  <th style={{ padding:"8px 10px", textAlign:"left", fontWeight:700 }}>Destination v3.1</th>
                  <th style={{ padding:"8px 10px", textAlign:"left", fontWeight:700, borderRadius:"0 8px 0 0" }}>Priorité</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["components/AegisInline.tsx", "Adapter au design Light/Glass", "src/components/brain/AegisChat.tsx", "P0"],
                  ["components/AiAssistant.tsx", "Fusionner dans AegisChat", "src/components/brain/AegisChat.tsx", "P0"],
                  ["services/geminiService.ts", "Conserver tel quel", "src/services/geminiService.ts", "P0"],
                  ["services/regulationKnowledge.ts", "Conserver tel quel", "src/services/regulationKnowledge.ts", "P0"],
                  ["api/gemini-proxy.ts", "Conserver tel quel", "api/gemini-proxy.ts", "P0"],
                  ["components/CookieBanner.tsx", "Adapter Light theme + RGPD fix", "src/components/common/CookieBanner.tsx", "P0"],
                  ["src/components/homepage/*", "Base v3.0 = GARDER", "src/components/homepage/* (inchangé)", "—"],
                  ["components/Dashboard.tsx", "Adapter Light/Glass + garder pour /platform", "src/components/platform/Dashboard.tsx", "P1"],
                  ["components/GamificationBadges.tsx", "Adapter Light/Glass", "src/components/platform/Gamification.tsx", "P2"],
                  ["data/reglements-europeens-2024.json", "Conserver tel quel", "src/data/reglements-europeens-2024.json", "P0"],
                  ["— (nouveau)", "React Router v6 + routes", "src/router.tsx", "P1"],
                  ["— (nouveau)", "AuthContext Supabase", "src/contexts/AuthContext.tsx", "P1"],
                  ["— (nouveau)", "HeroSection v3.1 avec Brain intégré", "Modifier HeroSection.tsx in-place", "P0"],
                ].map((row,i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, background: i%2===0 ? "#fff" : "#fafbfc" }}>
                    <td style={{ padding:"6px 10px", fontFamily:"monospace", fontSize:10 }}>{row[0]}</td>
                    <td style={{ padding:"6px 10px" }}>{row[1]}</td>
                    <td style={{ padding:"6px 10px", fontFamily:"monospace", fontSize:10 }}>{row[2]}</td>
                    <td style={{ padding:"6px 10px" }}>
                      <Badge
                        color={row[3]==="P0"?C.red:row[3]==="P1"?C.amber:row[3]==="P2"?C.accent:"#999"}
                        bg={row[3]==="P0"?C.redLight:row[3]==="P1"?C.amberLight:row[3]==="P2"?C.accentLight:"#f3f4f6"}
                      >{row[3]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Innovation Clé : Brain IA Above-the-Fold" badge="DIFFÉRENCIANT" badgeBg={C.green}>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.8, marginBottom:12 }}>
              Au lieu de cacher l'Assistant IA derrière un bouton (v2.6) ou de le supprimer (v3.0), <strong>on l'intègre directement dans le Hero</strong>. Le visiteur voit simultanément la promesse ET la preuve.
            </div>
            <div style={{
              background:"linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)",
              borderRadius:14, padding:20, border:`1px solid ${C.accent}22`,
            }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.textDim, letterSpacing:2, marginBottom:12, textAlign:"center" }}>
                HERO v3.1 — MAQUETTE CONCEPTUELLE
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                <div>
                  <div style={{ fontSize:9, fontWeight:700, color:C.accent, marginBottom:6 }}>COLONNE GAUCHE — PROPOSITION</div>
                  <div style={{ fontSize:14, fontWeight:800, color:C.text, lineHeight:1.3, marginBottom:8 }}>
                    L'ingénieur R&D<br/>
                    qui a conçu vos systèmes,<br/>
                    <span style={{ color:C.accent }}>pilote votre conformité EU.</span>
                  </div>
                  <div style={{ fontSize:10, color:C.textDim, lineHeight:1.6, marginBottom:12 }}>
                    32 ans · 6 groupes internationaux · 8 règlements EU maîtrisés
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <div style={{ background:C.accent, color:"#fff", padding:"6px 14px", borderRadius:8, fontSize:10, fontWeight:700 }}>
                      Essayer gratuitement →
                    </div>
                    <div style={{ border:`1px solid ${C.border}`, padding:"6px 14px", borderRadius:8, fontSize:10, fontWeight:600, color:C.text }}>
                      Voir les tarifs
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:12, marginTop:10 }}>
                    {["<30s analyse", "-70% coût", "0€ pour commencer"].map((t,i) => (
                      <span key={i} style={{ fontSize:9, color:C.textDim }}>✓ {t}</span>
                    ))}
                  </div>
                </div>
                <div style={{
                  ...glass, padding:14, boxShadow:C.shadowLg,
                  background:"rgba(255,255,255,0.85)",
                }}>
                  <div style={{ fontSize:9, fontWeight:700, color:C.accent, marginBottom:8, textAlign:"center" }}>
                    🧠 ASSISTANT AEGIS — EN DIRECT
                  </div>
                  <div style={{ background:"#f1f5f9", borderRadius:8, padding:10, marginBottom:8 }}>
                    <div style={{ fontSize:9, color:C.textDim }}>Exemple : Battery Regulation 2023/1542</div>
                    <div style={{ fontSize:10, color:C.text, marginTop:4, lineHeight:1.5 }}>
                      "Votre pack Li-ion est soumis à 4 obligations : passeport numérique (déc 2027), due diligence chaîne approvisionnement, taux recyclage 65%..."
                    </div>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4, justifyContent:"center" }}>
                    {["Battery Reg.", "AI Act", "REACH", "CRA", "Machinery"].map((r,i) => (
                      <span key={i} style={{ fontSize:8, padding:"2px 6px", borderRadius:10, background:C.accentLight, color:C.accent, fontWeight:600 }}>{r}</span>
                    ))}
                  </div>
                  <div style={{ textAlign:"center", marginTop:8, fontSize:9, color:C.green, fontWeight:700 }}>● Prêt — Posez votre question</div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 3 — FEEDBACK NICO                             */}
      {/* ═══════════════════════════════════════════════════ */}
      {tab === "nico" && (
        <div>
          <Section title="Feedback Nico — 10/02/2026" badge="INTÉGRATION" badgeBg={C.amber}>
            <div style={{ fontSize:11, color:C.textDim, marginBottom:12 }}>
              Chaque remarque de Nico tracée vers une action concrète dans v3.1
            </div>

            {[
              {
                quote: "On voit toujours ton CV... peut-être ajouter tes forces et ce que tu as fait ou apporté à toutes ces entreprises",
                status: "RÉSOLU v3.0 + RENFORCÉ v3.1",
                statusColor: C.green,
                action: "Le Hero v3.0 est déjà orienté valeur. v3.1 ajoute les métriques ROI concrètes (section Trust Badges étendue avec preuves terrain : Toyota, BMW, TGV M, bus ZEN). La timeline Parcours R&D reste mais avec l'angle 'ce que j'ai apporté' vs 'où j'ai travaillé'.",
              },
              {
                quote: "Modifie ta photo avec l'IA pour être dans le thème ou change de photo... une avec le sourire 😃 tu te vends JP",
                status: "ACTION JP REQUISE",
                statusColor: C.amber,
                action: "Deux options : (1) Nouvelle photo professionnelle avec sourire, fond neutre — JP la prend et la place dans /public/jpc.jpg. (2) Retouche IA de la photo existante (ajuster luminosité, fond, cadrage). La photo sera intégrée dans une carte glassmorphism avec nom + citation + LinkedIn + métriques clés. DÉCISION JP nécessaire.",
              },
              {
                quote: "Accentuer sur la fluidité, si un blaireau regarde je ne comprends pas directement où tu veux en venir... que leur apportes-tu? Efficacité en production? Quoi? Rentabilité? Combien?",
                status: "RÉSOLU v3.1",
                statusColor: C.green,
                action: "4 métriques ROI ajoutées above-the-fold : <30s analyse d'impact (vs 2-4 semaines), -70% coût veille (50€/mois vs 1500€/jour cabinet), 0 non-conformité en production (anticipée dès conception), 27+ États couverts. Le 'blaireau test' : en 5 secondes le visiteur voit QUOI (conformité EU), POUR QUI (ETI industrielles), COMBIEN (gratuit pour commencer).",
              },
              {
                quote: "Qu'est-ce que l'IA dit de ta présentation? Ça peut être intéressant...",
                status: "INTÉGRÉ",
                statusColor: C.green,
                action: "Le Brain IA Aegis visible dans le Hero EST la réponse. L'IA n'est pas un gadget — c'est le produit. Le visiteur voit l'IA en action avec un exemple réel (Battery Regulation) dès la première seconde.",
              },
              {
                quote: "Quand tu ouvres il faut que cela explique tout de suite de quoi on parle... car c'est les premières secondes qui te font continuer à lire ou pas",
                status: "RÉSOLU v3.0 + RENFORCÉ v3.1",
                statusColor: C.green,
                action: "Hero à 2 colonnes : gauche = proposition de valeur en 3 lignes + CTA, droite = Brain IA en direct. Zéro ambiguïté. Le visiteur comprend en 3 secondes : 'c'est un ingénieur + une IA qui m'aide à être conforme aux règlements EU'. Les badges de confiance (32 ans, 6 groupes, 27+ États) renforcent immédiatement.",
              },
            ].map((item,i) => (
              <div key={i} style={{ marginBottom:16, padding:16, background:i%2===0?"#fafbfc":"#fff", borderRadius:12, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:12, fontStyle:"italic", color:C.text, marginBottom:8, padding:"8px 12px", background:"#f1f5f9", borderRadius:8, borderLeft:`3px solid ${C.amber}` }}>
                  "{item.quote}"
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <Badge color={item.statusColor} bg={item.statusColor===C.green?C.greenLight:C.amberLight}>{item.status}</Badge>
                </div>
                <div style={{ fontSize:11, color:C.textDim, lineHeight:1.7 }}>{item.action}</div>
              </div>
            ))}
          </Section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 4 — SECTIONS HOMEPAGE v3.1                    */}
      {/* ═══════════════════════════════════════════════════ */}
      {tab === "sections" && (
        <div>
          <Section title="Homepage v3.1 — Architecture des Sections" badge="10 SECTIONS" badgeBg={C.accent}>
            <div style={{ fontSize:11, color:C.textDim, marginBottom:12 }}>
              Ordre optimisé pour conversion B2B. Chaque section a un rôle dans l'entonnoir.
            </div>

            {[
              {
                id:"S0", name:"NavBar", role:"Navigation + CTA", source:"v3.0 (garder)",
                spec:"Logo Aegis Circular + tagline + 'Essai gratuit' (bleu) + 'Connexion' (outline) + FR/EN toggle. Sticky top. Glass blur on scroll.",
                delta:"Aucun changement vs R4",
              },
              {
                id:"S1", name:"HeroSection v3.1", role:"CONVERSION — 5 secondes", source:"v3.0 + v2.6 Brain",
                spec:"2 colonnes. GAUCHE : headline 'L'ingénieur R&D qui a conçu vos systèmes, pilote votre conformité EU.' + sous-titre expertise + 2 CTA (Essayer / Tarifs) + 3 proof points métriques ROI (<30s, -70%, 0€). DROITE : Brain IA mini-demo LIVE avec réponse streaming Battery Regulation + badges réglements. Photo JP en médaillon coin supérieur gauche de la carte Brain.",
                delta:"MAJEUR — intégration Brain IA + métriques ROI + photo JP",
              },
              {
                id:"S2", name:"TrustBadges", role:"CRÉDIBILITÉ — social proof", source:"v3.0 (évoluer)",
                spec:"5 stats : 32 ans R&D, 6 groupes internationaux (avec logos), 27+ États UE, 5 secteurs, 50+ programmes. + Badges formation (MSc Coventry, Centrale Paris, EIT Digital 2025). + NOUVEAU : badges RGPD natif + Serveurs EU + Config IA Déterministe.",
                delta:"Ajouter logos clients inline (Autoliv, Saft, Faurecia, Forsee, Bombardier, Emerson) — images locales /public/images/clients/",
              },
              {
                id:"S3", name:"ParcoursRD", role:"EXPERTISE — preuves terrain", source:"v3.0 (évoluer)",
                spec:"Timeline 6 expériences avec ANGLE APPORT : chaque carte montre ce que JP a apporté, pas juste où il a travaillé. Ex: 'Autoliv : Industrialisé volants airbag nouvelle gen pour Toyota CH-R 2024 et BMW X1 (New Klass)'. Chaîne de valeur R&D en bas.",
                delta:"Reformuler chaque carte avec angle 'apport' (feedback Nico)",
              },
              {
                id:"S4", name:"SansAvecAegis", role:"PAIN POINTS — urgence", source:"v3.0 (garder)",
                spec:"Split Sans/Avec. Garder tel quel — très efficace. Le 'Sans Aegis' crée l'urgence, le 'Avec Aegis' montre la solution.",
                delta:"Aucun changement vs R4",
              },
              {
                id:"S5", name:"ServicesSection", role:"OFFRE — ce qu'on vend", source:"v3.0 (évoluer)",
                spec:"3 services mappés sur tiers : (1) Veille réglementaire IA → DISCOVER 0€, (2) Feuille de route conformité → STANDARD 50€/mois, (3) Ingénierie conformité R&D → PREMIUM 500€/mois. Chaque service = résultat concret + lien vers pricing.",
                delta:"Renforcer les descriptions avec résultats quantifiés",
              },
              {
                id:"S6", name:"PricingSection", role:"CONVERSION — décision", source:"v3.0 (garder)",
                spec:"3 tiers. DISCOVER 0€ (essai). STANDARD 50€/mois 'POPULAIRE' (IA pilotée). PREMIUM 500€/mois 'EXPERTISE' (ingénieur R&D dédié + IA). Annuel -17%.",
                delta:"Aucun changement majeur vs R4",
              },
              {
                id:"S7", name:"ReglementsSection", role:"CRÉDIBILITÉ — expertise prouvée", source:"v3.0 (garder)",
                spec:"8 cartes réglements avec lien expérience terrain. Battery Reg/Saft, AI Act/Autoliv, UNECE/Autoliv, REACH/Faurecia, CSRD, ESPR, CRA, EN 45545/Saft.",
                delta:"Aucun changement vs R4",
              },
              {
                id:"S8", name:"CTASection", role:"CONVERSION FINALE", source:"v3.0 (garder)",
                spec:"'Prêt à piloter votre conformité EU avec un vrai ingénieur R&D ?' + 2 CTA (Créer compte gratuit / Nous contacter).",
                delta:"Aucun changement vs R4",
              },
              {
                id:"S9", name:"FooterSection", role:"LÉGAL + CONTACT", source:"v3.0 + v2.6 CookieBanner",
                spec:"Footer existant + CookieBanner RGPD réintégré depuis v2.6 (adapté Light theme). Liens : Politique confidentialité, CGV, DPA Art.28 RGPD, Mentions légales. Contact : email + LinkedIn + formulaire.",
                delta:"Réintégrer CookieBanner.tsx (adapté)",
              },
            ].map((s,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"50px 1fr", gap:12, padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{
                  width:44, height:44, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center",
                  background: s.delta.includes("MAJEUR") ? C.redLight : s.delta.includes("Aucun") ? C.greenLight : C.amberLight,
                  fontSize:11, fontWeight:900,
                  color: s.delta.includes("MAJEUR") ? C.red : s.delta.includes("Aucun") ? C.green : C.amber,
                }}>{s.id}</div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:13, fontWeight:800, color:C.text }}>{s.name}</span>
                    <span style={{ fontSize:10, color:C.accent, fontWeight:600 }}>{s.role}</span>
                    <Badge color={C.textDim} bg="#f1f5f9">{s.source}</Badge>
                  </div>
                  <div style={{ fontSize:11, color:C.textDim, lineHeight:1.6, marginBottom:4 }}>{s.spec}</div>
                  <div style={{ fontSize:10, fontWeight:700, color: s.delta.includes("MAJEUR") ? C.red : s.delta.includes("Aucun") ? C.green : C.amber }}>
                    Δ {s.delta}
                  </div>
                </div>
              </div>
            ))}
          </Section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 5 — BRIEF AG                                  */}
      {/* ═══════════════════════════════════════════════════ */}
      {tab === "execution" && (
        <div>
          <Section title="Brief d'Exécution AG Nuit" badge="PRIORITÉ P0" badgeBg={C.red}>
            <div style={{ fontSize:12, color:C.text, lineHeight:1.7, marginBottom:16 }}>
              <strong>Contexte AG :</strong> Les fichiers source sont dans <code>C:\Projects\jeanpierrecharles\</code>. 
              L'architecture cible est la fusion de <code>components/</code> (v2.6) dans <code>src/components/</code> (v3.0) 
              avec le design system Light/Glass défini dans <code>src/components/homepage/constants.ts</code>.
              Le wireframe de référence est <code>wireframe-homepage-v3-r4.jsx</code>.
            </div>

            <div style={{ fontSize:13, fontWeight:800, color:C.red, marginBottom:12 }}>
              ⚠️ RÈGLE CRITIQUE : NE PAS git push AVANT validation Claude Opus
            </div>

            {[
              {
                phase:"PHASE 1 — Brain IA Integration (P0, 2h)",
                tasks:[
                  "Copier services/geminiService.ts → src/services/geminiService.ts (AUCUNE modification)",
                  "Copier services/regulationKnowledgeService.ts → src/services/regulationKnowledgeService.ts (AUCUNE modification)",
                  "Copier data/reglements-europeens-2024.json → src/data/ (AUCUNE modification)",
                  "Créer src/components/brain/AegisChat.tsx — adapter AegisInline.tsx + AiAssistant.tsx au design system Light/Glass (constants.ts). Le composant doit être auto-contenu et importable dans HeroSection.",
                  "Modifier HeroSection.tsx : layout 2 colonnes — gauche=texte actuel, droite=<AegisChat /> en mode mini-demo. Garder le dashboard preview actuel comme fallback si AegisChat pas prêt.",
                  "Tester : npm run dev → localhost:5173 → le chat IA doit répondre avec streaming",
                ],
              },
              {
                phase:"PHASE 2 — Métriques ROI + Photo (P0, 1h)",
                tasks:[
                  "Modifier TrustBadges.tsx : ajouter ligne de métriques ROI au-dessus des stats — '<30s analyse', '-70% coût', '0 non-conformité', '27+ États'",
                  "Ajouter logos clients dans TrustBadges : créer /public/images/clients/ avec logos SVG/PNG (Autoliv, Saft, Faurecia, Forsee, Bombardier, Emerson) — utiliser placeholder text si images pas dispo",
                  "Intégrer photo JP : dans la carte Brain IA (HeroSection), ajouter médaillon photo /public/jpc.jpg en haut à gauche avec border-radius:50%, width:48px",
                  "Reformuler ParcoursRD.tsx : chaque expérience angle 'apport' pas 'poste'. Ex: 'Industrialisé les volants airbag Toyota CH-R Europe 2024 et BMW New Klass'",
                ],
              },
              {
                phase:"PHASE 3 — RGPD + Polish (P1, 1h)",
                tasks:[
                  "Copier components/CookieBanner.tsx → src/components/common/CookieBanner.tsx — adapter couleurs Light theme (background blanc, texte dark, bordures glass)",
                  "Importer CookieBanner dans App.tsx (après FooterSection, position fixed bottom)",
                  "Corriger le texte cookie : remplacer mention Google par 'IA hébergée sur serveurs proxy sécurisés'",
                  "Vérifier responsive mobile : toutes les sections, navbar hamburger menu",
                  "Vérifier i18n : toutes les nouvelles sections doivent avoir FR + EN dans i18n.ts",
                ],
              },
            ].map((phase,i) => (
              <div key={i} style={{ marginBottom:16, padding:16, background:i===0?"#fef2f2":i===1?"#fefce8":"#f0fdf4", borderRadius:12, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:13, fontWeight:800, color:i===0?C.red:i===1?C.amber:C.green, marginBottom:10 }}>
                  {phase.phase}
                </div>
                {phase.tasks.map((task,j) => (
                  <div key={j} style={{ display:"flex", gap:8, padding:"4px 0", fontSize:11, color:C.text, lineHeight:1.6 }}>
                    <span style={{ color:C.textDim, fontWeight:700, flexShrink:0 }}>□ {j+1}.</span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            ))}
          </Section>

          <Section title="Fichiers de Référence" badge="SOURCES" badgeBg={C.purple}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { label:"Wireframe R4 (Light/Glass)", file:"wireframe-homepage-v3-r4.jsx", loc:"Claude outputs / Project" },
                { label:"Design System", file:"src/components/homepage/constants.ts", loc:"Local" },
                { label:"i18n Dictionnaire", file:"src/components/homepage/i18n.ts", loc:"Local" },
                { label:"Brain IA (source)", file:"components/AegisInline.tsx", loc:"Local v2.6" },
                { label:"Chat UI (source)", file:"components/AiAssistant.tsx", loc:"Local v2.6" },
                { label:"Gemini Service", file:"services/geminiService.ts", loc:"Local v2.6" },
                { label:"Knowledge Base", file:"services/regulationKnowledgeService.ts", loc:"Local v2.6" },
                { label:"Cookie Banner (source)", file:"components/CookieBanner.tsx", loc:"Local v2.6" },
                { label:"GANTT Lifecycle", file:"GANTT_KANBAN_LIFECYCLE_v3.0_20260216T1935.jsx", loc:"Claude outputs" },
                { label:"Contre-expertise sécurité", file:"CONTRE_EXPERTISE_DEFINITIVE_20260214_2000.md", loc:"Project" },
              ].map((ref,i) => (
                <div key={i} style={{ ...glass, padding:10, fontSize:10 }}>
                  <div style={{ fontWeight:700, color:C.text }}>{ref.label}</div>
                  <div style={{ fontFamily:"monospace", fontSize:9, color:C.accent, marginTop:2 }}>{ref.file}</div>
                  <div style={{ fontSize:9, color:C.textDim }}>{ref.loc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Critères de Validation (V-Gate Claude Opus)" badge="QUALITÉ" badgeBg={C.accent}>
            {[
              "Brain IA chat fonctionnel dans HeroSection avec streaming Gemini",
              "Métriques ROI visibles above-the-fold (<30s, -70%, 0 non-conformité, 27+ États)",
              "Photo JP visible dans la carte Brain (ou médaillon hero)",
              "Cookie banner RGPD affiché au premier chargement",
              "i18n FR/EN complet pour toutes les nouvelles sections",
              "Design system Light/Glass cohérent (constants.ts respecté)",
              "REGRESSION-1 fix préservé (aria-label, pas role=presentation)",
              "Responsive mobile OK (375px min)",
              "Aucun composant v2.6 orphelin importé dans App.tsx — tout via src/",
              "npm run build sans erreur TypeScript",
            ].map((criteria,i) => (
              <div key={i} style={{ display:"flex", gap:8, padding:"6px 0", borderBottom:`1px solid ${C.border}`, fontSize:11, color:C.text }}>
                <span style={{ color:C.accent, fontWeight:700 }}>□ V{i+1}</span>
                <span>{criteria}</span>
              </div>
            ))}
          </Section>

          <Section title="Retour d'Expérience — Lessons Learned" badge="REX" badgeBg="#6b7280">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { lesson:"Conversation supprimée = intelligence perdue", fix:"REGISTRE traçabilité doit capturer l'état de chaque audit conversation, pas seulement les actions.", color:C.red },
                { lesson:"Migration par substitution tue le produit", fix:"v2.6→v3.0 a coupé le Brain. Toute migration doit être additive (AJOUTER les nouveaux fichiers) puis soustractive (RETIRER les anciens après V&V).", color:C.red },
                { lesson:"Feedback utilisateur non formalisé en tickets", fix:"Chaque retour Nico/client doit être tracé : citation → action → section → statut. Ce document le fait.", color:C.amber },
                { lesson:"Deux arborescences sans contrat d'interface", fix:"v3.1 définit une arbo unique : src/components/{homepage,brain,platform,common}/ + src/services/ + src/data/", color:C.amber },
              ].map((l,i) => (
                <div key={i} style={{ padding:14, background:"#fafbfc", borderRadius:10, borderLeft:`3px solid ${l.color}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:l.color, marginBottom:4 }}>{l.lesson}</div>
                  <div style={{ fontSize:10, color:C.textDim, lineHeight:1.6 }}>{l.fix}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <div style={{ marginTop:20, borderTop:`1px solid ${C.border}`, paddingTop:12, textAlign:"center" }}>
        <div style={{ fontSize:9, color:C.textDim }}>
          AEGIS CIRCULAR · Proposition Stratégique v3.1 · 20260216T2145 · Claude Opus → AG Execution
        </div>
        <div style={{ fontSize:9, color:C.textDim }}>
          Sources : Scan visuel localhost+prod (16/02) · Feedback Nico (10/02) · RAG ChatGPT (13-15/02) · Contre-expertise (14/02) · Conv. supprimée 06/02 (reconstituée)
        </div>
      </div>
    </div>
  );
}
