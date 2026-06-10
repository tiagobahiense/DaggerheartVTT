import { Plus, Minus, Trash } from '@phosphor-icons/react';
import { ISheetMarker } from '../../types/sheetExtras';
import { createCustomMarker } from '../../lib/sheetMarkers';

interface SheetMarkersWidgetProps {
  markers: ISheetMarker[];
  onChange: (markers: ISheetMarker[]) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export function SheetMarkersWidget({
  markers,
  onChange,
  readOnly = false,
  compact = false,
}: SheetMarkersWidgetProps) {
  const updateMarker = (key: string, patch: Partial<ISheetMarker>) => {
    onChange(markers.map((m) => (m.key === key ? { ...m, ...patch } : m)));
  };

  const adjustValue = (marker: ISheetMarker, delta: number) => {
    let next = marker.value + delta;
    if (marker.min !== undefined) next = Math.max(marker.min, next);
    if (marker.max !== undefined) next = Math.min(marker.max, next);
    next = Math.max(0, next);
    updateMarker(marker.key, { value: next });
  };

  const removeMarker = (key: string) => {
    onChange(markers.filter((m) => m.key !== key));
  };

  if (!markers.length && readOnly) {
    return <p className="text-[10px] text-white/30 italic">—</p>;
  }

  return (
    <div className={`space-y-1.5 ${compact ? '' : 'space-y-2'}`}>
      {markers.map((marker) => (
        <div
          key={marker.key}
          className="flex items-center gap-2 bg-black/30 px-2 py-1.5 rounded border border-white/10"
        >
          {readOnly ? (
            <span className="flex-1 text-xs font-bold text-white truncate">{marker.label}</span>
          ) : (
            <input
              type="text"
              value={marker.label}
              onChange={(e) => updateMarker(marker.key, { label: e.target.value })}
              placeholder="Título..."
              className="flex-1 min-w-0 bg-transparent text-xs font-bold text-white outline-none border-b border-transparent focus:border-gold/40"
            />
          )}

          <div className="flex items-center gap-0.5 shrink-0">
            {!readOnly && (
              <button
                type="button"
                onClick={() => adjustValue(marker, -1)}
                className="w-6 h-6 rounded bg-black/50 border border-white/10 text-white/60 hover:text-white flex items-center justify-center"
              >
                <Minus size={11} />
              </button>
            )}
            <span className="w-8 text-center font-bold text-gold text-sm tabular-nums">
              {marker.value}
            </span>
            {!readOnly && (
              <button
                type="button"
                onClick={() => adjustValue(marker, 1)}
                className="w-6 h-6 rounded bg-black/50 border border-white/10 text-white/60 hover:text-white flex items-center justify-center"
              >
                <Plus size={11} />
              </button>
            )}
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() => removeMarker(marker.key)}
              className="p-1 text-white/20 hover:text-red-400 shrink-0"
            >
              <Trash size={13} />
            </button>
          )}
        </div>
      ))}

      {!readOnly && (
        <button
          type="button"
          onClick={() => onChange([...markers, createCustomMarker()])}
          className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-white/40 hover:text-gold border border-dashed border-white/10 hover:border-gold/30 rounded transition-colors"
        >
          <Plus size={12} /> Adicionar
        </button>
      )}
    </div>
  );
}
