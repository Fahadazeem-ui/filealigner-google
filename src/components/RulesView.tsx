import React, { useState } from 'react';
import { ThemeColors } from '../engine/themes';
import { UserCustomRule } from '../types';
import { TOP_LEVEL_DOMAINS } from '../engine/taxonomy';
import { checkUserRules } from '../engine/classifier';
import { BookOpen, Plus, Trash2, CheckCircle2, ArrowRight, Play, Sparkles, Folder, Tag } from 'lucide-react';

interface RulesViewProps {
  theme: ThemeColors;
  userRules: UserCustomRule[];
  setUserRules: React.Dispatch<React.SetStateAction<UserCustomRule[]>>;
}

export const RulesView: React.FC<RulesViewProps> = ({
  theme,
  userRules,
  setUserRules,
}) => {
  const [testFilename, setTestFilename] = useState('Quarterly_Report_2026.pdf');
  const [newRuleType, setNewRuleType] = useState<'extension' | 'regex'>('extension');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleTopDomain, setNewRuleTopDomain] = useState(TOP_LEVEL_DOMAINS[0]);
  const [newRuleSubFolder, setNewRuleSubFolder] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');

  // Test rule match
  const testExt = testFilename.includes('.') ? testFilename.substring(testFilename.lastIndexOf('.')) : '';
  const testVerdict = checkUserRules(testFilename, testExt, userRules);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRulePattern.trim()) return;

    const destination = [newRuleTopDomain];
    if (newRuleSubFolder.trim()) {
      destination.push(newRuleSubFolder.trim());
    }

    const newRule: UserCustomRule = {
      id: `rule-${Date.now()}`,
      type: newRuleType,
      pattern: newRulePattern.trim(),
      destination,
      description: newRuleDesc.trim() || undefined,
    };

    setUserRules(prev => [...prev, newRule]);
    setNewRulePattern('');
    setNewRuleSubFolder('');
    setNewRuleDesc('');
  };

  const handleDeleteRule = (id: string) => {
    setUserRules(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden select-none">
      {/* Top Banner */}
      <div 
        className="px-6 py-4 border-b space-y-1 transition-colors duration-200"
        style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder }}
      >
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: theme.pillActiveBg, color: theme.pillActiveFg }}
          >
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight" style={{ color: theme.fg }}>
              Custom Taxonomy & Routing Rules
            </h2>
            <p className="text-[11px]" style={{ color: theme.fg_muted }}>
              Custom rules execute with priority (99% confidence), matching exact extensions or regex patterns.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left pane: Rule list & Add rule form */}
        <div className="lg:col-span-8 flex flex-col border-r overflow-y-auto p-6 space-y-4" style={{ borderColor: theme.panelBorder }}>
          {/* Add Rule Form */}
          <form 
            onSubmit={handleAddRule}
            className="p-5 rounded-3xl border space-y-4 shadow-sm"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: theme.fg }}>Add New Custom Rule</span>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium" style={{ color: theme.fg }}>
                  <input
                    type="radio"
                    name="ruleType"
                    checked={newRuleType === 'extension'}
                    onChange={() => setNewRuleType('extension')}
                    className="accent-indigo-500"
                  />
                  <span>Extension (.ext)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium" style={{ color: theme.fg }}>
                  <input
                    type="radio"
                    name="ruleType"
                    checked={newRuleType === 'regex'}
                    onChange={() => setNewRuleType('regex')}
                    className="accent-indigo-500"
                  />
                  <span>Regex Pattern</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                  {newRuleType === 'extension' ? 'Extension (e.g. .blend or .dat)' : 'Regex pattern (e.g. ^invoice.*\\.pdf$)'}
                </label>
                <input
                  type="text"
                  required
                  value={newRulePattern}
                  onChange={e => setNewRulePattern(e.target.value)}
                  placeholder={newRuleType === 'extension' ? '.xyz' : '^my_file_.*'}
                  className="w-full px-3 py-2 rounded-2xl border text-xs font-mono outline-none"
                  style={{
                    backgroundColor: theme.entryBg,
                    borderColor: theme.entryBorder,
                    color: theme.fg,
                  }}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                  Destination Top Category
                </label>
                <select
                  value={newRuleTopDomain}
                  onChange={e => setNewRuleTopDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border text-xs font-medium outline-none cursor-pointer"
                  style={{
                    backgroundColor: theme.entryBg,
                    borderColor: theme.entryBorder,
                    color: theme.fg,
                  }}
                >
                  {TOP_LEVEL_DOMAINS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                  Sub-Folder Name (Optional)
                </label>
                <input
                  type="text"
                  value={newRuleSubFolder}
                  onChange={e => setNewRuleSubFolder(e.target.value)}
                  placeholder="e.g. 3D Models or Invoices"
                  className="w-full px-3 py-2 rounded-2xl border text-xs outline-none"
                  style={{
                    backgroundColor: theme.entryBg,
                    borderColor: theme.entryBorder,
                    color: theme.fg,
                  }}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                  Description / Human Label (Optional)
                </label>
                <input
                  type="text"
                  value={newRuleDesc}
                  onChange={e => setNewRuleDesc(e.target.value)}
                  placeholder="e.g. Blender Workspace Files"
                  className="w-full px-3 py-2 rounded-2xl border text-xs outline-none"
                  style={{
                    backgroundColor: theme.entryBg,
                    borderColor: theme.entryBorder,
                    color: theme.fg,
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2 rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                style={{
                  background: theme.accentGradient,
                  color: theme.accent_fg,
                  boxShadow: theme.accentGlow,
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>
          </form>

          {/* Active Rules List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider px-1 opacity-70" style={{ color: theme.fg }}>
              Configured Rules ({userRules.length})
            </h3>

            {userRules.length === 0 ? (
              <div className="py-12 text-center text-xs opacity-60" style={{ color: theme.fg_muted }}>
                No custom rules defined yet. Add a rule above to customize file placement.
              </div>
            ) : (
              userRules.map(rule => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-xs transition-all hover:scale-[1.005]"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase"
                      style={{
                        backgroundColor: theme.pillActiveBg,
                        color: theme.pillActiveFg,
                      }}
                    >
                      {rule.type}
                    </span>
                    <span className="font-mono font-bold truncate" style={{ color: theme.fg }}>
                      {rule.pattern}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                    <span className="font-semibold truncate flex items-center gap-1" style={{ color: theme.accent }}>
                      <Folder className="w-3.5 h-3.5" />
                      {rule.destination.join('/')}
                    </span>
                    {rule.description && (
                      <span className="text-[11px] opacity-60 truncate">({rule.description})</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right pane: Interactive Rule Tester */}
        <div 
          className="lg:col-span-4 p-6 space-y-5 overflow-y-auto glass-panel select-none"
          style={{ backgroundColor: theme.sidebarBg }}
        >
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: theme.panelBorder }}>
            <Sparkles className="w-4 h-4" style={{ color: theme.accent }} />
            <span className="font-bold text-xs" style={{ color: theme.fg }}>Live Rule Simulator</span>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold block" style={{ color: theme.fg }}>
              Test Filename:
            </label>
            <input
              type="text"
              value={testFilename}
              onChange={e => setTestFilename(e.target.value)}
              placeholder="e.g. project_assets_2026.zip"
              className="w-full px-3 py-2 rounded-2xl border text-xs font-mono outline-none"
              style={{
                backgroundColor: theme.entryBg,
                borderColor: theme.entryBorder,
                color: theme.fg,
              }}
            />
          </div>

          <div 
            className="p-4 rounded-3xl border space-y-3"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
          >
            <div className="text-xs font-bold" style={{ color: theme.fg }}>Simulation Result:</div>

            {testVerdict ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Rule Match Success!</span>
                </div>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="opacity-60">Routed to: </span>
                    <strong style={{ color: theme.accent }}>{testVerdict.path}</strong>
                  </div>
                  <div>
                    <span className="opacity-60">Confidence: </span>
                    <strong style={{ color: theme.ok }}>{Math.round(testVerdict.confidence * 100)}% ({testVerdict.level})</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs opacity-70 italic space-y-1" style={{ color: theme.fg_muted }}>
                <p>No custom user rule matched this filename.</p>
                <p>It will fall through to default content signature analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
