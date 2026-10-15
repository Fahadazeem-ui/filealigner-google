import React, { useState, useMemo } from 'react';
import { ThemeColors, BadgeTheme } from '../engine/themes';
import { FileItem, SearchHit, AppSettings } from '../types';
import { formatBytes } from '../engine/sampleFiles';
import { TOP_LEVEL_DOMAINS, PARTIAL_EXT } from '../engine/taxonomy';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  FileText, 
  ArrowUpDown, 
  ChevronRight, 
  X, 
  Folder, 
  Copy, 
  CheckCircle2, 
  Sparkles,
  Info,
  SlidersHorizontal,
  FileArchive,
  Image as ImageIcon,
  FileCode,
  FileBox
} from 'lucide-react';

interface SearchViewProps {
  theme: ThemeColors;
  settings: AppSettings;
  items: FileItem[];
  scopePath: string;
}

export const SearchView: React.FC<SearchViewProps> = ({
  theme,
  settings,
  items,
  scopePath,
}) => {
  const [query, setQuery] = useState('');
  const [sureOnly, setSureOnly] = useState(settings.search.sure_only);
  const [excludePartial, setExcludePartial] = useState(settings.search.exclude_partial);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeHitId, setActiveHitId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'size' | 'confidence' | 'mtime'>('confidence');
  const [sortAsc, setSortAsc] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [copied, setCopied] = useState(false);

  // Content-aware search filter
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items
      .filter(item => {
        // Exclude partial downloads
        if (excludePartial) {
          const lower = item.name.toLowerCase();
          for (const pe of PARTIAL_EXT) {
            if (lower.endsWith(pe)) return false;
          }
        }

        // Sure only
        if (sureOnly && item.verdict.level !== 'Sure') {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && !item.category.toLowerCase().startsWith(selectedCategory.toLowerCase())) {
          return false;
        }

        // Search query matching
        if (q) {
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchLabel = item.verdict.label.toLowerCase().includes(q);
          const matchEvidence = item.verdict.evidence.some(e => e.toLowerCase().includes(q));
          if (!matchName && !matchCat && !matchLabel && !matchEvidence) {
            return false;
          }
        }

        return true;
      })
      .map((item): SearchHit => {
        let conf = item.verdict.confidence;
        const evidence = [...item.verdict.evidence];
        if (q && item.name.toLowerCase().includes(q)) {
          evidence.unshift(`Filename contains query "${q}"`);
          conf = Math.min(1.0, conf + 0.05);
        }

        return {
          id: item.id,
          name: item.name,
          path: item.source,
          size: item.size,
          mtime: item.mtime,
          confidence: conf,
          level: item.verdict.level,
          category: item.category,
          evidence,
          verdict: item.verdict,
        };
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'confidence') cmp = a.confidence - b.confidence;
        else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortField === 'size') cmp = a.size - b.size;
        else if (sortField === 'mtime') cmp = a.mtime - b.mtime;
        return sortAsc ? cmp : -cmp;
      });
  }, [items, query, sureOnly, excludePartial, selectedCategory, sortField, sortAsc]);

  const activeHit = useMemo(() => {
    if (!activeHitId) return searchResults[0] || null;
    return searchResults.find(h => h.id === activeHitId) || searchResults[0] || null;
  }, [searchResults, activeHitId]);

  const toggleSort = (field: 'name' | 'size' | 'confidence' | 'mtime') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoriesList = ['All', 'Games', 'Documents', 'Images', 'Archives', 'Software', 'AI & Models', 'Review'];

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden select-none">
      {/* Top Search Controls */}
      <div 
        className="px-6 py-4 border-b space-y-3.5 transition-colors duration-200"
        style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder }}
      >
        {/* Main Search Query Bar */}
        <div className="flex items-center gap-3">
          <div 
            className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl border shadow-inner transition-all"
            style={{
              backgroundColor: theme.entryBg,
              borderColor: theme.entryBorder,
            }}
          >
            <Search className="w-4 h-4 opacity-60" style={{ color: theme.accent }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by true file signature, document keywords, project name..."
              className="w-full bg-transparent border-none outline-none text-xs font-medium"
              style={{ color: theme.fg }}
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="opacity-50 hover:opacity-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle Inspector Pane Button */}
          <button
            onClick={() => setShowDetails(prev => !prev)}
            className="px-4 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            style={{
              background: showDetails ? theme.pillActiveBg : theme.buttonBg,
              borderColor: theme.panelBorder,
              color: showDetails ? theme.pillActiveFg : theme.fg,
            }}
          >
            <Info className="w-4 h-4" />
            <span>{showDetails ? "Hide Info" : "Details"}</span>
          </button>
        </div>

        {/* Category Pill Filters & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categoriesList.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer"
                  style={{
                    background: isActive ? theme.pillActiveBg : 'transparent',
                    color: isActive ? theme.pillActiveFg : theme.fg_muted,
                    border: isActive ? `1px solid ${theme.panelBorder}` : '1px solid transparent',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-medium" style={{ color: theme.fg }}>
              <input
                type="checkbox"
                checked={sureOnly}
                onChange={e => setSureOnly(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span>Sure Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium" style={{ color: theme.fg }}>
              <input
                type="checkbox"
                checked={excludePartial}
                onChange={e => setExcludePartial(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span>Exclude Partials</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Search Results & Collapsible Inspector Split */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Results List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-2">
          {searchResults.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <Search className="w-12 h-12 mx-auto opacity-30" style={{ color: theme.accent }} />
              <p className="text-sm font-semibold" style={{ color: theme.fg }}>
                No files matched your search criteria.
              </p>
              <p className="text-xs" style={{ color: theme.fg_muted }}>
                Try modifying your query or unchecking "Sure Only".
              </p>
            </div>
          ) : (
            searchResults.map(hit => {
              const isActive = activeHit?.id === hit.id;
              return (
                <div
                  key={hit.id}
                  onClick={() => setActiveHitId(hit.id)}
                  className="p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer hover:scale-[1.005]"
                  style={{
                    backgroundColor: isActive ? theme.pillActiveBg : theme.cardBg,
                    borderColor: isActive ? theme.accent : theme.cardBorder,
                    boxShadow: isActive ? theme.pillActiveGlow : 'none',
                  }}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm"
                      style={{
                        backgroundColor: hit.level === 'Sure' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(129, 140, 248, 0.15)',
                        borderColor: hit.level === 'Sure' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(129, 140, 248, 0.3)',
                        color: hit.level === 'Sure' ? theme.ok : theme.accent,
                      }}
                    >
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-xs tracking-tight truncate" style={{ color: theme.fg }}>
                        {hit.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] mt-0.5" style={{ color: theme.fg_muted }}>
                        <span>{formatBytes(hit.size)}</span>
                        <span>•</span>
                        <span>{hit.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                      style={{
                        backgroundColor: hit.level === 'Sure' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 146, 60, 0.15)',
                        color: hit.level === 'Sure' ? theme.ok : theme.warn,
                      }}
                    >
                      {hit.level} ({Math.round(hit.confidence * 100)}%)
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Collapsible Inspector Drawer */}
        {showDetails && activeHit && (
          <aside 
            className="w-80 md:w-96 shrink-0 border-l p-5 flex flex-col justify-between overflow-y-auto glass-panel select-none transition-all duration-300"
            style={{
              backgroundColor: theme.sidebarBg,
              borderColor: theme.sidebarBorder,
              boxShadow: theme.windowShadow,
            }}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: theme.panelBorder }}>
                <span className="font-bold text-xs tracking-tight" style={{ color: theme.fg }}>
                  Hit Evidence & Path
                </span>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-1.5 rounded-xl border opacity-70 hover:opacity-100 cursor-pointer"
                  style={{ backgroundColor: theme.buttonBg, borderColor: theme.panelBorder }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hit Header */}
              <div 
                className="p-4 rounded-3xl border space-y-2"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
              >
                <h3 className="font-bold text-xs tracking-tight break-all" style={{ color: theme.fg }}>
                  {activeHit.name}
                </h3>
                <p className="text-[11px] font-medium" style={{ color: theme.fg_muted }}>
                  {activeHit.verdict.label}
                </p>
                <div className="pt-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="opacity-70">Confidence:</span>
                    <span className="font-mono font-bold" style={{ color: activeHit.level === 'Sure' ? theme.ok : theme.warn }}>
                      {Math.round(activeHit.confidence * 100)}% ({activeHit.level})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden p-0.5 border" style={{ backgroundColor: theme.entryBg, borderColor: theme.entryBorder }}>
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${activeHit.confidence * 100}%`,
                        background: theme.storageGradient,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Path & Copy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold" style={{ color: theme.fg_muted }}>
                  <span>Location:</span>
                  <button
                    onClick={() => handleCopy(activeHit.path)}
                    className="text-[11px] hover:underline cursor-pointer flex items-center gap-1"
                    style={{ color: theme.accent }}
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div 
                  className="p-3 rounded-2xl border text-xs font-mono break-all"
                  style={{ backgroundColor: theme.entryBg, borderColor: theme.entryBorder, color: theme.accent }}
                >
                  {activeHit.path}
                </div>
              </div>

              {/* Evidence Chain */}
              <div className="space-y-2">
                <span className="text-xs font-semibold" style={{ color: theme.fg }}>
                  Why this file was identified:
                </span>
                <div 
                  className="p-3.5 rounded-2xl border space-y-2 text-xs"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                >
                  {activeHit.evidence.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: theme.ok }} />
                      <span className="leading-relaxed text-[11px]" style={{ color: theme.fg }}>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: theme.panelBorder }}>
              <div className="flex justify-between text-[11px]" style={{ color: theme.fg_muted }}>
                <span>Size: <strong style={{ color: theme.fg }}>{formatBytes(activeHit.size)}</strong></span>
                <span>Modified: <strong style={{ color: theme.fg }}>{new Date(activeHit.mtime).toLocaleDateString()}</strong></span>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Search Footer */}
      <footer 
        className="px-6 py-2.5 border-t flex items-center justify-between text-xs"
        style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder, color: theme.fg_muted }}
      >
        <span>
          Showing <strong style={{ color: theme.fg }}>{searchResults.length}</strong> of {items.length} files
        </span>
        <span className="text-[11px]">
          Content-aware search inspects underlying bytes and metadata.
        </span>
      </footer>
    </div>
  );
};
