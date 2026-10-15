import React, { useState, useMemo } from 'react';
import { ThemeColors } from '../engine/themes';
import { FileItem, DupGroup, DupItem } from '../types';
import { findDuplicates, calculateWastedSpace } from '../engine/duplicates';
import { formatBytes } from '../engine/sampleFiles';
import { 
  CopyCheck, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  CheckSquare, 
  Square,
  Sparkles,
  HelpCircle,
  HardDrive,
  FileText,
  FolderOpen
} from 'lucide-react';

interface DuplicatesViewProps {
  theme: ThemeColors;
  items: FileItem[];
  onRemoveDuplicates: (deleteIds: string[]) => void;
}

export const DuplicatesView: React.FC<DuplicatesViewProps> = ({
  theme,
  items,
  onRemoveDuplicates,
}) => {
  const [sameExtension, setSameExtension] = useState(true);
  const [duplicateGroups, setDuplicateGroups] = useState<DupGroup[]>(() => {
    return findDuplicates(items, true);
  });

  // Re-calculate when items or options change
  React.useEffect(() => {
    setDuplicateGroups(findDuplicates(items, sameExtension));
  }, [items, sameExtension]);

  const wastedSpace = useMemo(() => {
    return calculateWastedSpace(duplicateGroups);
  }, [duplicateGroups]);

  const totalDuplicatesCount = useMemo(() => {
    return duplicateGroups.reduce((acc, g) => acc + g.items.filter(i => !i.keep).length, 0);
  }, [duplicateGroups]);

  const toggleKeep = (groupIndex: number, itemId: string) => {
    setDuplicateGroups(prev => {
      return prev.map((g, gIdx) => {
        if (gIdx !== groupIndex) return g;
        return {
          ...g,
          items: g.items.map(it => {
            if (it.id === itemId) {
              return { ...it, keep: !it.keep };
            }
            return it;
          })
        };
      });
    });
  };

  const handleApplyCleanup = () => {
    const idsToDelete: string[] = [];
    for (const g of duplicateGroups) {
      for (const it of g.items) {
        if (!it.keep) {
          idsToDelete.push(it.id);
        }
      }
    }
    if (idsToDelete.length === 0) return;
    onRemoveDuplicates(idsToDelete);
  };

  const handleSelectOnlyHighestVersion = () => {
    setDuplicateGroups(prev => {
      return prev.map(g => {
        return {
          ...g,
          items: g.items.map((it, idx) => ({
            ...it,
            keep: idx === 0 // Highest version is ranked first
          }))
        };
      });
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden select-none">
      {/* Top Smart Cleanup Header */}
      <div 
        className="px-6 py-4 border-b space-y-4 transition-colors duration-200"
        style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
              style={{
                background: theme.accentGradient,
                color: theme.accent_fg,
                boxShadow: theme.accentGlow,
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight" style={{ color: theme.fg }}>
                Smart Duplicate Cleanup
              </h2>
              <p className="text-[11px]" style={{ color: theme.fg_muted }}>
                Identifies duplicate versions, download copies (e.g. `(1)`, `copy`), and old installers.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectOnlyHighestVersion}
              className="px-4 py-2 rounded-2xl text-xs font-semibold border transition-all hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: theme.buttonBg,
                borderColor: theme.panelBorder,
                color: theme.fg,
              }}
            >
              Select Highest Versions
            </button>

            <button
              onClick={handleApplyCleanup}
              disabled={totalDuplicatesCount === 0}
              className="px-5 py-2 rounded-2xl text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-40"
              style={{
                background: theme.accentGradient,
                color: theme.accent_fg,
                boxShadow: theme.accentGlow,
              }}
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1.5" />
              Clean {totalDuplicatesCount} File(s) ({formatBytes(wastedSpace)})
            </button>
          </div>
        </div>

        {/* Space Recovery Meter Card */}
        <div 
          className="p-4 rounded-3xl border flex items-center justify-between gap-6"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
          }}
        >
          <div className="flex items-center gap-4">
            <HardDrive className="w-8 h-8 opacity-70" style={{ color: theme.accent }} />
            <div>
              <div className="text-xs font-semibold" style={{ color: theme.fg }}>
                Recoverable Disk Space
              </div>
              <div className="text-xl font-extrabold font-mono" style={{ color: theme.accent }}>
                {formatBytes(wastedSpace)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium" style={{ color: theme.fg }}>
              <input
                type="checkbox"
                checked={sameExtension}
                onChange={e => setSameExtension(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span>Match exact extension only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Duplicate Groups Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
        {duplicateGroups.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div 
              className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center opacity-40 shadow-inner"
              style={{ backgroundColor: theme.cardBg }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: theme.ok }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: theme.fg }}>
              No duplicate or redundant versions detected!
            </p>
            <p className="text-xs" style={{ color: theme.fg_muted }}>
              Your workspace folder is clean and optimized.
            </p>
          </div>
        ) : (
          duplicateGroups.map((group, groupIdx) => {
            const olderItems = group.items.filter(i => !i.keep);

            return (
              <div 
                key={group.key}
                className="rounded-3xl border overflow-hidden transition-all duration-200"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                }}
              >
                {/* Group Header */}
                <div 
                  className="px-5 py-3 border-b flex items-center justify-between text-xs"
                  style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder }}
                >
                  <div className="flex items-center gap-2 font-bold" style={{ color: theme.fg }}>
                    <CopyCheck className="w-4 h-4" style={{ color: theme.accent }} />
                    <span>Group: {group.key}</span>
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: theme.fg_muted }}>
                    {group.items.length} versions found • {olderItems.length} marked for cleanup
                  </span>
                </div>

                {/* Items in Group */}
                <div className="p-3 space-y-2">
                  {group.items.map((item, itemIdx) => {
                    const isNewest = itemIdx === 0;

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleKeep(groupIdx, item.id)}
                        className="p-3 rounded-2xl border flex items-center justify-between gap-4 transition-all cursor-pointer hover:scale-[1.005]"
                        style={{
                          backgroundColor: item.keep ? theme.cardBg : 'rgba(239, 68, 68, 0.08)',
                          borderColor: item.keep ? theme.cardBorder : 'rgba(239, 68, 68, 0.25)',
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button 
                            className="cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              toggleKeep(groupIdx, item.id);
                            }}
                          >
                            {item.keep ? (
                              <CheckSquare className="w-4 h-4" style={{ color: theme.ok }} />
                            ) : (
                              <Square className="w-4 h-4 opacity-40" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs tracking-tight truncate" style={{ color: theme.fg }}>
                                {item.name}
                              </span>
                              {isNewest && (
                                <span 
                                  className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
                                  style={{
                                    backgroundColor: 'rgba(52, 211, 153, 0.2)',
                                    color: theme.ok,
                                  }}
                                >
                                  Recommended (Newest)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] opacity-70 mt-0.5" style={{ color: theme.fg_muted }}>
                              {formatBytes(item.size)} • Modified {new Date(item.mtime).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span 
                            className="text-xs font-semibold"
                            style={{ color: item.keep ? theme.ok : theme.unsure }}
                          >
                            {item.keep ? "Keep File" : "Delete / Clean"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <footer 
        className="px-6 py-2.5 border-t flex items-center justify-between text-xs"
        style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder, color: theme.fg_muted }}
      >
        <span>
          <strong style={{ color: theme.fg }}>{duplicateGroups.length}</strong> duplicate sets analyzed
        </span>
        <span className="text-[11px]">
          Safety Guarantee: The newest / highest version is preserved automatically.
        </span>
      </footer>
    </div>
  );
};
