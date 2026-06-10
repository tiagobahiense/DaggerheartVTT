import { Plus, Minus, Trash, DiceSix, Hash, ListNumbers } from '@phosphor-icons/react';
import { ISheetMarker } from '../../types/sheetExtras';

interface SheetMarkersWidgetProps {
  markers: ISheetMarker[];
  onChange: (markers: ISheetMarker[]) => void;
  readOnly?: boolean;
}

const typeIcon = (type: ISheetMarker['type']) => {
  switch (type) {
    case 'number':
      return <Hash size={14} />;
    case 'dice':
      return <DiceSix size={14} />;
    case 'counter':
      return <ListNumbers size={14} />;
    default:
      return <Hash size={14} />;
  }
};

export function SheetMarkersWidget({ markers, onChange, readOnly = false }: SheetMarkersWidgetProps) {
  const updateMarker = (key: string, patch: Partial<ISheetMarker>) => {
    onChange(markers.map((m) => (m.key === key ? { ...m, ...patch } : m)));
  };

  const adjustValue = (marker: ISheetMarker, delta: number) => {
    let next = marker.value + delta;
    if (marker.min !== undefined) next = Math.max(marker.min, next);
    if (marker.max !== undefined) next = Math.min(marker.max, next);
    if (marker.type === 'counter') next = Math.max(0, next);
    updateMarker(marker.key, { value: next });
  };

  const addCustom = () => {
    const id = `custom_${Date.now()}`;
    onChange([
      ...markers,
      {
        id,
        key: id,
        label: 'Marcador',
        type: 'counter',
        value: 0,
        source: 'custom',
        isClassSpecific: false,
      },
    ]);
  };

  const removeMarker = (key: string) => {
    onChange(markers.filter((m) => m.key !== key || m.isClassSpecific));
  };

  if (!markers.length && readOnly) {
    return <p className="text-xs text-white/40 italic">Nenhum marcador ativo.</p>;
  }

  return (
    <div className="space-y-2">
      {markers.map((marker) => (
        <div
          key={marker.key}
          className="flex items-center gap-2 bg-black/30 p-2 rounded border border-white/10 hover:border-white/20 transition-colors"
          title={marker.description}
        >
          <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-gold shrink-0">
            {typeIcon(marker.type)}
          </div>

          <div className="flex-1 min-w-0">
            {marker.source === 'custom' && !readOnly ? (
              <input
                type="text"
                value={marker.label}
                onChange={(e) => updateMarker(marker.key, { label: e.target.value })}
                className="w-full bg-transparent text-xs font-bold text-white outline-none border-b border-transparent focus:border-gold/50"
              />
            ) : (
              <span className="text-xs font-bold text-white block truncate">{marker.label}</span>
            )}
            {marker.description && (
              <span className="text-[9px] text-white/40 block truncate">{marker.description}</span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {marker.type === 'text' ? (
              readOnly ? (
                <span className="text-xs text-white/70 max-w-[80px] truncate">{marker.note || '—'}</span>
              ) : (
                <input
                  type="text"
                  value={marker.note || ''}
                  onChange={(e) => updateMarker(marker.key, { note: e.target.value })}
                  placeholder="Nota..."
                  className="w-20 bg-black/40 text-xs text-white text-center rounded border border-white/10 px-1 py-0.5 outline-none focus:border-gold"
                />
              )
            ) : (
              <>
                {!readOnly && (
                  <button
                    onClick={() => adjustValue(marker, -1)}
                    className="w-6 h-6 rounded bg-black/50 border border-white/10 text-white/70 hover:text-white hover:border-white/30 flex items-center justify-center"
                  >
                    <Minus size={12} />
                  </button>
                )}
                <span className="w-10 text-center font-bold text-gold text-sm">
                  {marker.type === 'dice' && marker.dieSides
                    ? `d${marker.dieSides}: ${marker.value}`
                    : marker.value}
                </span>
                {!readOnly && (
                  <button
                    onClick={() => adjustValue(marker, 1)}
                    className="w-6 h-6 rounded bg-black/50 border border-white/10 text-white/70 hover:text-white hover:border-white/30 flex items-center justify-center"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </>
            )}
          </div>

          {marker.source === 'custom' && !readOnly && (
            <button
              onClick={() => removeMarker(marker.key)}
              className="p-1 text-white/20 hover:text-red-400 transition-colors shrink-0"
            >
              <Trash size={14} />
            </button>
          )}
        </div>
      ))}

      {!readOnly && (
        <button
          onClick={addCustom}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-white/50 hover:text-gold border border-dashed border-white/10 hover:border-gold/30 rounded transition-colors"
        >
          <Plus size={14} /> Adicionar marcador
        </button>
      )}
    </div>
  );
}
