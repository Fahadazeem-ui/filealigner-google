import React, { useState } from 'react';
import { ThemeColors, THEMES } from '../engine/themes';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../engine/settings';
import { X, Sliders, Palette, MousePointer, FolderSync, Search, Cpu, Info, RotateCcw, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  theme: ThemeColors;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'interaction' | 'sort' | 'search' | 'performance' | 'about'>('appearance');
  const [draft, setDraft] = useState<AppSettings>(() => JSON.parse(JSON.stringify(settings)));

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all FileSorter settings to defaults?")) {
      const def = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      setDraft(def);
      onSave(def);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 select-none">
      <div 
        className="w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden glass-panel"
        style={{
          backgroundColor: theme.windowBg,
          borderColor: theme.windowBorder,
          color: theme.fg,
          boxShadow: theme.windowShadow,
        }}
      >
        {/* Modal Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: theme.accentGradient, color: theme.accent_fg }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight" style={{ color: theme.fg }}>
                Preferences & Settings
              </h3>
              <p className="text-[11px]" style={{ color: theme.fg_muted }}>
                Customize visual themes, sorting rules, and engine concurrency
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

        {/* Modal Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Tabs sidebar */}
          <div 
            className="w-48 border-r p-3 space-y-1 overflow-y-auto"
            style={{ backgroundColor: theme.sidebarBg, borderColor: theme.panelBorder }}
          >
            {[
              { id: 'appearance', label: 'Appearance', icon: Palette },
              { id: 'interaction', label: 'Interaction', icon: MousePointer },
              { id: 'sort', label: 'Sort & Taxonomy', icon: FolderSync },
              { id: 'search', label: 'Search Engine', icon: Search },
              { id: 'performance', label: 'Performance', icon: Cpu },
              { id: 'about', label: 'About Engine', icon: Info },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer"
                  style={{
                    background: isActive ? theme.pillActiveBg : 'transparent',
                    color: isActive ? theme.pillActiveFg : theme.fg,
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto text-xs space-y-5" style={{ backgroundColor: theme.panelBg }}>
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <label className="font-bold block mb-2" style={{ color: theme.fg }}>
                    Aurora Glass Theme
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.values(THEMES).map(t => {
                      const isSel = draft.appearance.theme === t.key;
                      return (
                        <div
                          key={t.key}
                          onClick={() => setDraft(prev => ({ ...prev, appearance: { ...prev.appearance, theme: t.key } }))}
                          className="p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                          style={{
                            backgroundColor: isSel ? theme.pillActiveBg : theme.cardBg,
                            borderColor: isSel ? theme.accent : theme.cardBorder,
                            boxShadow: isSel ? theme.pillActiveGlow : 'none',
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-xs" style={{ color: theme.fg }}>{t.label}</span>
                            {isSel && <Check className="w-3.5 h-3.5" style={{ color: theme.accent }} />}
                          </div>
                          <div 
                            className="w-full h-8 rounded-xl shadow-inner border"
                            style={{ background: t.canvasGradients, borderColor: t.panelBorder }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1" style={{ color: theme.fg }}>
                    <span>GUI Scale Factor</span>
                    <span className="font-mono text-xs">{draft.appearance.gui_scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="75"
                    max="150"
                    step="5"
                    value={draft.appearance.gui_scale}
                    onChange={e => setDraft(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, gui_scale: parseInt(e.target.value) }
                    }))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px]" style={{ color: theme.fg_muted }}>
                    <span>75% (Compact)</span>
                    <span>100% (Standard)</span>
                    <span>150% (Large)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Interaction Tab */}
            {activeTab === 'interaction' && (
              <div className="space-y-4">
                <div>
                  <label className="font-bold block mb-1" style={{ color: theme.fg }}>
                    Confirmation Before Moving Files
                  </label>
                  <select
                    value={draft.interaction.confirm_sort}
                    onChange={e => setDraft(prev => ({
                      ...prev,
                      interaction: { ...prev.interaction, confirm_sort: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 rounded-2xl border text-xs outline-none cursor-pointer"
                    style={{ backgroundColor: theme.entryBg, borderColor: theme.entryBorder, color: theme.fg }}
                  >
                    <option value="always">Always ask confirmation</option>
                    <option value="many">Ask only when sorting &gt; 50 files</option>
                    <option value="never">Never ask (Immediate execute)</option>
                  </select>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer font-medium" style={{ color: theme.fg }}>
                  <input
                    type="checkbox"
                    checked={draft.interaction.confirm_undo}
                    onChange={e => setDraft(prev => ({
                      ...prev,
                      interaction: { ...prev.interaction, confirm_undo: e.target.checked }
                    }))}
                    className="rounded accent-indigo-500"
                  />
                  <span>Confirm before running Undo restore</span>
                </label>
              </div>
            )}

            {/* Sort Tab */}
            {activeTab === 'sort' && (
              <div className="space-y-4">
                <label className="flex items-center gap-2.5 cursor-pointer font-medium" style={{ color: theme.fg }}>
                  <input
                    type="checkbox"
                    checked={draft.sort.remove_empty}
                    onChange={e => setDraft(prev => ({
                      ...prev,
                      sort: { ...prev.sort, remove_empty: e.target.checked }
                    }))}
                    className="rounded accent-indigo-500"
                  />
                  <span>Prune empty directories after moving contents</span>
                </label>

                <div>
                  <label className="font-bold block mb-1" style={{ color: theme.fg }}>
                    Default Auto-Select Mode
                  </label>
                  <select
                    value={draft.sort.auto_select}
                    onChange={e => setDraft(prev => ({
                      ...prev,
                      sort: { ...prev.sort, auto_select: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 rounded-2xl border text-xs outline-none cursor-pointer"
                    style={{ backgroundColor: theme.entryBg, borderColor: theme.entryBorder, color: theme.fg }}
                  >
                    <option value="all">Auto-select all files</option>
                    <option value="sure">Auto-select only 'Sure' files (&gt;90% confidence)</option>
                    <option value="none">Do not auto-select (manual review)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-4">
                <label className="flex items-center gap-2.5 cursor-pointer font-medium" style={{ color: theme.fg }}>
                  <input
                    type="checkbox"
                    checked={draft.performance.conservative_pc}
                    onChange={e => setDraft(prev => ({
                      ...prev,
                      performance: { ...prev.performance, conservative_pc: e.target.checked }
                    }))}
                    className="rounded accent-indigo-500"
                  />
                  <span>Conservative mode (smooth animations, smaller batches for low-spec PCs)</span>
                </label>

                <div>
                  <label className="font-bold block mb-1" style={{ color: theme.fg }}>
                    Worker Concurrency
                  </label>
                  <select
                    value={draft.performance.workers}
                    onChange={e => setDraft(prev => ({
                      ...prev,
                      performance: { ...prev.performance, workers: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-2xl border text-xs outline-none cursor-pointer"
                    style={{ backgroundColor: theme.entryBg, borderColor: theme.entryBorder, color: theme.fg }}
                  >
                    <option value="auto">Auto (Adaptive based on file count)</option>
                    <option value="2">2 workers (Conservative)</option>
                    <option value="4">4 workers (Balanced)</option>
                    <option value="8">8 workers (Ultra Turbo)</option>
                  </select>
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <div className="p-4 rounded-3xl border leading-relaxed space-y-2" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <h4 className="font-bold text-sm" style={{ color: theme.fg }}>
                    FileSorter 5.0 (Aurora Glass Edition)
                  </h4>
                  <p style={{ color: theme.fg_muted }}>
                    Advanced content-aware file classification, deep search, and duplicate cleanup software with soft blooming aesthetics.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-4 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-2 text-rose-500 border-rose-500/30 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Settings to Factory Defaults</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl text-xs font-semibold border transition-all hover:scale-105 cursor-pointer"
            style={{ backgroundColor: theme.buttonBg, borderColor: theme.panelBorder, color: theme.fg }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            style={{
              background: theme.accentGradient,
              color: theme.accent_fg,
              boxShadow: theme.accentGlow,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
