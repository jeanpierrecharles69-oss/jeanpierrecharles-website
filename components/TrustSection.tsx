import React, { useState } from 'react';
import { Language } from '../translations';
import { PlayIcon } from './icons/PlayIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface TrustSectionProps {
  lang: Language;
}

const TrustSection: React.FC<TrustSectionProps> = ({ lang }) => {
  const [activeTestimonial, setActiveTestimonial] = useState<number | null>(null);

  const text = {
    fr: {
      title: 'Expertise Industrielle Prouvée',
      subtitle: 'Plus de 30 ans d\'expérience avec des leaders internationaux',
      stats: {
        clients: { value: '6+', label: 'Groupes Internationaux' },
        compliance: { value: '30+', label: 'Années d\'Expertise' },
        savings: { value: '8', label: 'Règlements EU Maîtrisés' },
        time: { value: '5', label: 'Secteurs Industriels' }
      },
      // Témoignages supprimés - À remplacer par des témoignages réels
      testimonials: {
        title: 'Parcours Professionnel',
        items: []
      }
    },
    en: {
      title: 'Proven Industrial Expertise',
      subtitle: 'Over 30 years of experience with international leaders',
      stats: {
        clients: { value: '6+', label: 'International Groups' },
        compliance: { value: '30+', label: 'Years of Expertise' },
        savings: { value: '8', label: 'EU Regulations Mastered' },
        time: { value: '5', label: 'Industrial Sectors' }
      },
      // Testimonials removed - To be replaced with real testimonials
      testimonials: {
        title: 'Professional Journey',
        items: []
      }
    }
  };

  const content = text[lang];

  // Logos des entreprises réelles du parcours (CV vérifié)
  const clientLogos = [
    { name: 'Autoliv', logo: '/images/clients/autoliv-logo.svg', alt: 'Autoliv Group' },
    { name: 'Forsee Power', logo: '/images/clients/forsee-logo.svg', alt: 'Forsee Power' },
    { name: 'Saft', logo: '/images/clients/saft-logo.svg', alt: 'Saft (TotalEnergies)' },
    { name: 'Faurecia', logo: '/images/clients/faurecia-logo.svg', alt: 'Faurecia' },
    { name: 'Thales', logo: '/images/clients/thales-logo.svg', alt: 'Thales Group' },
    { name: 'Emerson', logo: '/images/clients/emerson-logo.svg', alt: 'Emerson (Branson)' },
  ];

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">{content.title}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{content.subtitle}</p>
        </div>

        {/* Client Logos Grid */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-60 hover:opacity-100 transition-opacity duration-500">
            {clientLogos.map((client, idx) => (
              <div
                key={idx}
                className="h-16 w-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
              >
                <img
                  src={client.logo}
                  alt={client.alt}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-slate-400 font-bold text-sm">${client.name}</span>`;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {Object.values(content.stats).map((stat, idx) => (
            <div
              key={idx}
              className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group"
            >
              <div className="text-4xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Section Parcours - Témoignages à venir */}
        {content.testimonials.items.length > 0 && (
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-slate-900 text-center mb-12">
              {content.testimonials.title}
            </h3>
            {/* Témoignages seront ajoutés ici quand disponibles */}
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium">30+ Années Expertise</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium">8 Règlements EU</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium">Config IA Déterministe</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium">Hébergement EU</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TrustSection;
