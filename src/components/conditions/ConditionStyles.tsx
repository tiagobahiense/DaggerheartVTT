/** Estilos globais de aura e animação para condições nos tokens */
export function ConditionGlobalStyles() {
  return (
    <style>{`
      @keyframes condition-pulse-red {
        0%, 100% { box-shadow: 0 0 8px rgba(239,68,68,0.4), 0 0 0 2px rgba(239,68,68,0.3); }
        50% { box-shadow: 0 0 18px rgba(239,68,68,0.7), 0 0 0 3px rgba(239,68,68,0.5); }
      }
      @keyframes condition-shimmer-stealth {
        0%, 100% { opacity: 0.85; filter: brightness(0.9); }
        50% { opacity: 0.65; filter: brightness(1.1) hue-rotate(15deg); }
      }
      @keyframes condition-float-ghost {
        0%, 100% { transform: translateY(0); opacity: 0.9; }
        50% { transform: translateY(-2px); opacity: 0.75; }
      }
      @keyframes condition-shield-gold {
        0%, 100% { box-shadow: 0 0 10px rgba(251,191,36,0.35), inset 0 0 8px rgba(251,191,36,0.1); }
        50% { box-shadow: 0 0 20px rgba(251,191,36,0.6), inset 0 0 12px rgba(251,191,36,0.2); }
      }
      @keyframes condition-sleep-pulse {
        0%, 100% { box-shadow: 0 0 10px rgba(129,140,248,0.4); }
        50% { box-shadow: 0 0 18px rgba(129,140,248,0.65); }
      }

      .condition-aura-vulnerable { animation: condition-pulse-red 2s ease-in-out infinite; }
      .condition-aura-hidden,
      .condition-aura-oculto,
      .condition-aura-invisible { animation: condition-shimmer-stealth 3s ease-in-out infinite; }
      .condition-aura-incorporeal { animation: condition-float-ghost 2.5s ease-in-out infinite; }
      .condition-aura-protected { animation: condition-shield-gold 2.5s ease-in-out infinite; }
      .condition-aura-asleep { animation: condition-sleep-pulse 3s ease-in-out infinite; }
      .condition-aura-immobilized { box-shadow: 0 0 0 2px rgba(34,211,238,0.5), 0 0 12px rgba(34,211,238,0.3); }
      .condition-aura-stunned,
      .condition-aura-unconscious { filter: grayscale(0.35) brightness(0.85); }
      .condition-aura-charmed { box-shadow: 0 0 14px rgba(236,72,153,0.45); }
      .condition-aura-dissociated { box-shadow: 0 0 14px rgba(217,70,239,0.4); }
      .condition-aura-generic { box-shadow: 0 0 10px rgba(255,255,255,0.2); }
    `}</style>
  );
}
