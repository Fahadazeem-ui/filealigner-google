import React from 'react';
import { ThemeColors } from '../engine/themes';
import { JournalRecord } from '../types';
import { RotateCcw, X, CheckCircle2, History, AlertCircle, ArrowRight } from 'lucide-react';

interface UndoModalProps {
  isOpen: boolean;
  onClose: () => void;
  journals: JournalRecord[];
  onRevertJournal: (journalId: string) => void;
  theme: ThemeColors;
}

export const UndoModal: React.FC<UndoModalProps> = ({
  isOpen,
  onClose,
  journals,
  onRevertJournal,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 select-none">
      <div 
        className="w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col max-h-[80vh] overflow-hidden glass-panel"
        style={{
          backgroundColor: theme.windowBg,
          borderColor: theme.windowBorder,
          color: theme.fg,
          boxShadow: theme.windowShadow,
        }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: theme.accentGradient, color: theme.accent_fg }}
            >
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight" style={{ color: theme.fg }}>
                Undo Journal & Rollback History
              </h3>
              <p className="text-[11px]" style={{ color: theme.fg_muted }}>
                Every sort action is recorded with zero data loss guarantee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border opacity-70 hover:opacity-100 hover:scale-105 transition-all cursor-pointer"
            style={{ backgroundColor: theme.buttonBg, borderColor: theme.panelBorder }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs" style={{ backgroundColor: theme.panelBg }}>
          {journals.length === 0 ? (
            <div className="py-20 text-center opacity-60 space-y-2">
              <History className="w-10 h-10 mx-auto opacity-40" style={{ color: theme.accent }} />
              <p className="font-bold text-xs" style={{ color: theme.fg }}>No sort journals on record.</p>
              <p className="text-[11px]" style={{ color: theme.fg_muted }}>
                When you execute "Sort Selected", instant undo rollback checkpoints are saved here.
              </p>
            </div>
          ) : (
            journals.map((j, idx) => (
              <div
                key={j.id}
                className="p-4 rounded-3xl border space-y-3 transition-all"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="px-2.5 py-0.5 rounded-full font-mono font-bold text-xs"
                      style={{ backgroundColor: theme.pillActiveBg, color: theme.pillActiveFg }}
                    >
                      Run #{journals.length - idx}
                    </span>
                    <span className="text-[11px] opacity-70" style={{ color: theme.fg_muted }}>
                      {new Date(j.timestamp).toLocaleString()}
                    </span>
                    {j.undone && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                        Restored
                      </span>
                    )}
                  </div>

                  {!j.undone && (
                    <button
                      onClick={() => onRevertJournal(j.id)}
                      className="px-4 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer text-white"
                      style={{ backgroundColor: theme.warn }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Items</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px]" style={{ color: theme.fg_muted }}>
                  <span>Scope Root: </span>
                  <span className="font-mono font-semibold" style={{ color: theme.fg }}>{j.scope}</span>
                </div>

                {/* Moved files preview */}
                <div 
                  className="p-3 rounded-2xl border font-mono text-[10px] space-y-1.5 max-h-28 overflow-y-auto"
                  style={{ backgroundColor: theme.entryBg, borderColor: theme.entryBorder }}
                >
                  {j.moved.slice(0, 5).map(([src, dst], i) => (
                    <div key={i} className="truncate flex items-center gap-1.5">
                      <span className="opacity-50">{src}</span>
                      <ArrowRight className="w-3 h-3 shrink-0 opacity-50" />
                      <span style={{ color: theme.accent }}>{dst}</span>
                    </div>
                  ))}
                  {j.moved.length > 5 && (
                    <div className="opacity-50 italic pt-1">
                      + {j.moved.length - 5} more files moved in this operation
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-3 border-t flex justify-end"
          style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl text-xs font-semibold border cursor-pointer hover:scale-105 transition-all"
            style={{ backgroundColor: theme.buttonBg, borderColor: theme.panelBorder, color: theme.fg }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
