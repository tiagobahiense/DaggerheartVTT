import { CONDITION_CATEGORIES, CONDITION_MAP, CONDITIONS } from '../../data/conditions';
import { ConditionId } from '../../types/sheetExtras';
import { CONDITION_ICONS, CONDITION_ICON_FALLBACK } from './conditionIcons';

interface ConditionsPickerProps {
  active: ConditionId[];
  onChange: (active: ConditionId[]) => void;
  compact?: boolean;
}

export function ConditionsPicker({ active, onChange, compact = false }: ConditionsPickerProps) {
  const toggle = (id: ConditionId) => {
    if (active.includes(id)) {
      onChange(active.filter((c) => c !== id));
    } else {
      onChange([...active, id]);
    }
  };

  return (
    <div className="space-y-3">
      {CONDITION_CATEGORIES.map((cat) => {
        const items = CONDITIONS.filter((c) => c.category === cat.id);
        if (!items.length) return null;
        return (
          <div key={cat.id}>
            <span className="text-[9px] uppercase tracking-widest text-white/35 font-bold block mb-1.5">
              {cat.label}
            </span>
            <div className={`flex flex-wrap gap-1.5 ${compact ? '' : 'gap-2'}`}>
              {items.map((cond) => {
                const isActive = active.includes(cond.id);
                const icon = CONDITION_ICONS[cond.id] || CONDITION_ICON_FALLBACK;
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => toggle(cond.id)}
                    title={cond.description}
                    className={`
                      group flex items-center gap-1 rounded-lg border transition-all duration-200
                      ${compact ? 'px-1.5 py-1 text-[9px]' : 'px-2 py-1.5 text-[10px]'}
                      ${isActive
                        ? `${cond.borderColor} ${cond.color} ${cond.glowColor} scale-[1.02]`
                        : 'border-white/10 text-white/35 bg-black/25 hover:border-white/25 hover:text-white/60'}
                    `}
                  >
                    <span className={`shrink-0 ${isActive ? cond.color : 'text-white/25 group-hover:text-white/50'}`}>
                      {icon}
                    </span>
                    <span className="font-bold uppercase tracking-wide whitespace-nowrap">
                      {compact ? cond.shortLabel : cond.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {active.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-[9px] text-white/30 hover:text-red-400 uppercase tracking-wider transition-colors"
        >
          Limpar todas
        </button>
      )}
    </div>
  );
}

/** Exibição somente leitura com ícones */
export function ConditionsDisplay({
  active,
  compact = true,
  maxShow = 6,
}: {
  active: ConditionId[];
  compact?: boolean;
  maxShow?: number;
}) {
  if (!active.length) return null;
  const visible = active.slice(0, maxShow);
  const overflow = active.length - maxShow;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((id) => {
        const cond = CONDITION_MAP[id];
        if (!cond) return null;
        const icon = CONDITION_ICONS[id] || CONDITION_ICON_FALLBACK;
        return (
          <span
            key={id}
            title={`${cond.label}: ${cond.description}`}
            className={`
              inline-flex items-center gap-1 font-bold uppercase leading-none border rounded-lg
              ${cond.borderColor} ${cond.color} ${cond.glowColor}
              ${compact ? 'text-[8px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'}
            `}
          >
            {icon}
            {cond.shortLabel}
          </span>
        );
      })}
      {overflow > 0 && (
        <span className="text-[8px] text-white/40 self-center">+{overflow}</span>
      )}
    </div>
  );
}
