import { CONDITIONS } from '../../data/conditions';
import { ConditionId } from '../../types/sheetExtras';

interface ConditionsWidgetProps {
  active: ConditionId[];
  onChange: (active: ConditionId[]) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export function ConditionsWidget({
  active,
  onChange,
  readOnly = false,
  compact = false,
}: ConditionsWidgetProps) {
  const toggle = (id: ConditionId) => {
    if (readOnly) return;
    if (active.includes(id)) {
      onChange(active.filter((c) => c !== id));
    } else {
      onChange([...active, id]);
    }
  };

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? '' : 'gap-2'}`}>
      {CONDITIONS.map((cond) => {
        const isActive = active.includes(cond.id);
        return (
          <button
            key={cond.id}
            onClick={() => toggle(cond.id)}
            disabled={readOnly}
            title={cond.description}
            className={`
              px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border transition-all
              ${isActive ? cond.borderColor + ' ' + cond.color : 'border-white/10 text-white/30 bg-black/20'}
              ${readOnly ? 'cursor-default' : 'hover:border-white/30 cursor-pointer'}
              ${compact ? 'px-1.5 py-0.5 text-[9px]' : ''}
            `}
          >
            {compact ? cond.shortLabel : cond.label}
          </button>
        );
      })}
    </div>
  );
}
