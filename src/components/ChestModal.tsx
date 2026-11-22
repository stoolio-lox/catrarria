import React from 'react';
import { Archive, PackageCheck, X } from 'lucide-react';
import { ITEMS } from '../game/catalog';
import { InventorySlot } from '../game/types';
import { ItemIcon } from './ItemIcon';

interface ChestModalProps {
  chest: {
    tx: number;
    ty: number;
    items: (InventorySlot | null)[];
  };
  onTakeItem: (index: number) => void;
  onTakeAll: () => void;
  onClose: () => void;
}

export const ChestModal: React.FC<ChestModalProps> = ({
  chest,
  onTakeItem,
  onTakeAll,
  onClose,
}) => {
  const nonEmptyCount = chest.items.filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/65"
      role="dialog"
      aria-modal="true"
      aria-label="Сундук сокровищ"
    >
      <div className="w-full max-w-md bg-[#0e172a] border border-amber-400/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#09101f]">
          <div className="flex items-center gap-2.5">
            <Archive className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-lg text-amber-300">
              Сундук сокровищ
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть сундук"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chest Items List */}
        <div className="p-4 overflow-y-auto game-scroll space-y-2">
          {nonEmptyCount === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              Сундук пуст. Все сокровища уже в твоём рюкзаке!
            </div>
          ) : (
            chest.items.map((slot, idx) => {
              if (!slot) return null;
              const def = ITEMS[slot.itemId];
              return (
                <div
                  key={`${slot.itemId}-${idx}`}
                  className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5"
                >
                  <div className="w-11 h-11 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                    <ItemIcon itemId={slot.itemId} size={30} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white truncate">
                      {def?.name ?? slot.itemId}{' '}
                      {slot.count > 1 && (
                        <span className="text-amber-300 font-mono-num">×{slot.count}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {def?.description ?? ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTakeItem(idx)}
                    aria-label={`Забрать ${def?.name ?? slot.itemId}`}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Забрать
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#09101f]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Закрыть
          </button>
          {nonEmptyCount > 0 && (
            <button
              type="button"
              onClick={onTakeAll}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Забрать всё</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
