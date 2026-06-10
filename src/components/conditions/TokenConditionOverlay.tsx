import { CONDITION_MAP } from '../../data/conditions';
import { getPrimaryAuraClass } from '../../lib/tokenConditions';
import { ConditionId } from '../../types/sheetExtras';
import { CONDITION_ICONS, CONDITION_ICON_FALLBACK } from './conditionIcons';

interface TokenConditionOverlayProps {
  conditions: ConditionId[];
  showIcons?: boolean;
}

/** Aura + ícones flutuantes no canto do token */
export function TokenConditionOverlay({ conditions, showIcons = true }: TokenConditionOverlayProps) {
  if (!conditions.length) return null;

  const auraClass = getPrimaryAuraClass(conditions);
  const topIcons = conditions.slice(0, 3);

  return (
    <>
      {auraClass && (
        <div
          className={`absolute inset-0 rounded-[inherit] pointer-events-none z-[15] ${auraClass}`}
          aria-hidden
        />
      )}
      {showIcons && (
        <div className="absolute -top-1 -right-1 z-[25] flex flex-col gap-0.5 pointer-events-none">
          {topIcons.map((id) => {
            const cond = CONDITION_MAP[id];
            if (!cond) return null;
            return (
              <div
                key={id}
                title={cond.label}
                className={`
                  w-5 h-5 rounded-full border flex items-center justify-center
                  bg-black/85 backdrop-blur-sm
                  ${cond.borderColor} ${cond.color}
                `}
              >
                <span className="scale-75">{CONDITION_ICONS[id] || CONDITION_ICON_FALLBACK}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
