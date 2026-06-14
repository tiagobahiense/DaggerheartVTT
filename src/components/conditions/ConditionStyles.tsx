/** Estilos globais de aura e animação para condições nos tokens */
export function ConditionGlobalStyles() {
  return (
    <style>{`
      @keyframes condition-pulse-red {
        0%, 100% { box-shadow: 0 0 10px rgba(239,68,68,0.55), 0 0 0 3px rgba(239,68,68,0.45); }
        50% { box-shadow: 0 0 22px rgba(239,68,68,0.85), 0 0 0 5px rgba(239,68,68,0.65); }
      }
      @keyframes condition-shimmer-stealth {
        0%, 100% { opacity: 0.95; box-shadow: 0 0 14px rgba(148,163,184,0.55), 0 0 0 3px rgba(148,163,184,0.35); }
        50% { opacity: 0.7; box-shadow: 0 0 24px rgba(196,181,253,0.65), 0 0 0 4px rgba(196,181,253,0.45); }
      }
      @keyframes condition-float-ghost {
        0%, 100% { transform: translateY(0); box-shadow: 0 0 16px rgba(167,139,250,0.55), 0 0 0 3px rgba(167,139,250,0.35); }
        50% { transform: translateY(-2px); box-shadow: 0 0 26px rgba(196,181,253,0.75), 0 0 0 4px rgba(196,181,253,0.5); }
      }
      @keyframes condition-shield-gold {
        0%, 100% { box-shadow: 0 0 14px rgba(251,191,36,0.55), 0 0 0 3px rgba(251,191,36,0.45); }
        50% { box-shadow: 0 0 26px rgba(251,191,36,0.85), 0 0 0 5px rgba(251,191,36,0.65); }
      }
      @keyframes condition-sleep-pulse {
        0%, 100% { box-shadow: 0 0 14px rgba(129,140,248,0.55), 0 0 0 3px rgba(129,140,248,0.4); }
        50% { box-shadow: 0 0 24px rgba(129,140,248,0.8), 0 0 0 5px rgba(129,140,248,0.6); }
      }
      @keyframes condition-shake-amber {
        0%, 100% { box-shadow: 0 0 12px rgba(245,158,11,0.5), 0 0 0 3px rgba(245,158,11,0.35); }
        50% { box-shadow: 0 0 22px rgba(251,191,36,0.75), 0 0 0 4px rgba(251,191,36,0.55); }
      }
      @keyframes condition-frost-cyan {
        0%, 100% { box-shadow: 0 0 12px rgba(34,211,238,0.5), 0 0 0 3px rgba(34,211,238,0.35); }
        50% { box-shadow: 0 0 20px rgba(56,189,248,0.75), 0 0 0 4px rgba(56,189,248,0.55); }
      }

      .token-aura-ring { opacity: 0.95; }
      .token-aura-inner { opacity: 0.35; }

      .condition-aura-vulnerable { animation: condition-pulse-red 2s ease-in-out infinite; }
      .condition-aura-hidden,
      .condition-aura-oculto,
      .condition-aura-invisible { animation: condition-shimmer-stealth 3s ease-in-out infinite; }
      .condition-aura-incorporeal { animation: condition-float-ghost 2.5s ease-in-out infinite; }
      .condition-aura-protected { animation: condition-shield-gold 2.5s ease-in-out infinite; }
      .condition-aura-asleep { animation: condition-sleep-pulse 3s ease-in-out infinite; }
      .condition-aura-shaken { animation: condition-shake-amber 2.2s ease-in-out infinite; }
      .condition-aura-restrained,
      .condition-aura-immobilized { animation: condition-frost-cyan 2.4s ease-in-out infinite; }
      .condition-aura-stunned,
      .condition-aura-unconscious {
        box-shadow: 0 0 16px rgba(234,179,8,0.45), 0 0 0 3px rgba(234,179,8,0.35);
        filter: grayscale(0.25) brightness(0.9);
      }
      .condition-aura-charmed { box-shadow: 0 0 18px rgba(236,72,153,0.6), 0 0 0 3px rgba(236,72,153,0.45); }
      .condition-aura-dissociated { box-shadow: 0 0 18px rgba(217,70,239,0.55), 0 0 0 3px rgba(217,70,239,0.4); }
      .condition-aura-generic { box-shadow: 0 0 14px rgba(255,255,255,0.35), 0 0 0 3px rgba(255,255,255,0.25); }
    `}</style>
  );
}
