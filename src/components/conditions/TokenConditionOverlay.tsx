import { CONDITION_MAP } from '../../data/conditions';
import { getPrimaryAuraClass, getPrimaryConditionId } from '../../lib/tokenConditions';
import { ConditionId } from '../../types/sheetExtras';
import { CONDITION_ICONS, CONDITION_ICON_FALLBACK } from './conditionIcons';

interface TokenConditionOverlayProps {
  conditions: ConditionId[];
  showIcons?: boolean;
}

/** Aura colorida + ícones visíveis no token */
export function TokenConditionOverlay({ conditions, showIcons = true }: TokenConditionOverlayProps) {
  if (!conditions.length) return null;

  const auraClass = getPrimaryAuraClass(conditions);
  const primaryId = getPrimaryConditionId(conditions);
  const primaryCond = primaryId ? CONDITION_MAP[primaryId] : null;
  const topIcons = conditions.slice(0, 3);

  return (
    <>
      {auraClass && (
        <>
          <div
            className={`absolute -inset-[5px] rounded-[inherit] pointer-events-none z-[12] token-aura-ring ${auraClass}`}
            aria-hidden
          />
          <div
            className={`absolute inset-0 rounded-[inherit] pointer-events-none z-[15] token-aura-inner ${auraClass}`}
            aria-hidden
          />
        </>
      )}
      {showIcons && (
        <div className="absolute -top-2 -right-2 z-[25] flex flex-col gap-0.5 pointer-events-none">
          {topIcons.map((id) => {
            const cond = CONDITION_MAP[id];
            if (!cond) return null;
            return (
              <div
                key={id}
                title={cond.label}
                className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center
                  bg-black/90 backdrop-blur-sm shadow-lg
                  ${cond.borderColor} ${cond.color}
                `}
              >
                <span className="scale-90">{CONDITION_ICONS[id] || CONDITION_ICON_FALLBACK}</span>
              </div>
            );
          })}
        </div>
      )}
      {primaryCond && (
        <span className="sr-only">{primaryCond.label}</span>
      )}
    </>
  );
}
