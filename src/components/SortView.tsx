import React, { useState, useMemo, useRef } from 'react';
import { ThemeColors, BadgeTheme } from '../engine/themes';
import { FileItem, AppSettings } from '../types';
import { formatBytes } from '../engine/sampleFiles';
import { exportOrganizedZip } from './ZipExporter';
import { ViewMode } from './Header';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  CheckSquare, 
  Square, 
  MinusSquare, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Check, 
  RotateCcw, 
  Download, 
  Sparkles, 
  Upload,
  Info,
  ShieldCheck,
  Search as SearchIcon,
  Copy,
  ExternalLink,
  X,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  FileBox,
  MoreVertical,
  SlidersHorizontal,
  CheckCircle2,
  FolderPlus
} from 'lucide-react';

interface SortViewProps {
  theme: ThemeColors;
  settings: AppSettings;
  items: FileItem[];
  setItems: React.Dispatch<React.SetStateAction<FileItem[]>>;
  scopePath: string;
  setScopePath: (p: string) => void;
  destPath: string;
  setDestPath: (p: string) => void;
  onPreview: (mode: 'sort' | 'audit') => void;
  onSort: (selectedItems: FileItem[]) => void;
  onUndoLast: () => void;
  onLoadPreset: (presetName: string) => void;
  onUploadFiles: (files: FileList) => void;
  isLoading: boolean;
  progressPercent: number;
  progressStage: string;
  viewMode: ViewMode;
  showInspector: boolean;
  setShowInspector: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  auditModeOnly?: boolean;
}

export const SortView: React.FC<SortViewProps> = ({
  theme,
  settings,
  items,
  setItems,
  scopePath,
  setScopePath,
  destPath,
  setDestPath,
  onPreview,
  onSort,
  onUndoLast,
  onLoadPreset,
  onUploadFiles,
  isLoading,
  progressPercent,
  progressStage,
  viewMode,
  showInspector,
  setShowInspector,
  searchQuery,
  auditModeOnly = false,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'sure' | 'unsure' | 'review'>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Group items by destination category
  const categories = useMemo(() => {
    const map: Record<string, FileItem[]> = {};
    for (const it of items) {
      if (!map[it.category]) {
        map[it.category] = [];
      }
      map[it.category].push(it);
    }
    return map;
  }, [items]);

  // Filtered items based on filterMode and searchQuery
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter(it => {
      if (filterMode === 'sure' && it.verdict.level !== 'Sure') return false;
      if (filterMode === 'unsure' && it.verdict.level === 'Sure') return false;
      if (filterMode === 'review' && it.verdict.dest[0] !== 'Review') return false;
      if (q) {
        const matchName = it.name.toLowerCase().includes(q);
        const matchCat = it.category.toLowerCase().includes(q);
        const matchLabel = it.verdict.label.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchLabel) return false;
      }
      return true;
    });
  }, [items, filterMode, searchQuery]);

  // Filtered grouped categories
  const filteredCategories = useMemo(() => {
    const res: Record<string, FileItem[]> = {};
    for (const it of filteredItems) {
      if (!res[it.category]) res[it.category] = [];
      res[it.category].push(it);
    }
    return res;
  }, [filteredItems]);

  // Selected item for the side inspector
  const activeItem = useMemo(() => {
    if (selectedItemId) {
      const found = items.find(i => i.id === selectedItemId);
      if (found) return found;
    }
    return filteredItems[0] || items[0] || null;
  }, [items, filteredItems, selectedItemId]);

  // Summary counts
  const counts = useMemo(() => {
    let sure = 0, probably = 0, unsure = 0, review = 0, selected = 0, totalSize = 0;
    for (const it of items) {
      if (it.selected) selected++;
      totalSize += it.size;
      if (it.verdict.dest[0] === 'Review') review++;
      else if (it.verdict.level === 'Sure') sure++;
      else if (it.verdict.level === 'Probably') probably++;
      else unsure++;
    }
    return { sure, probably, unsure, review, selected, totalSize };
  }, [items]);

  const toggleItemSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItems(prev => prev.map(it => it.id === id ? { ...it, selected: !it.selected } : it));
  };

  const toggleCategorySelect = (cat: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const groupItems = categories[cat] || [];
    const allSelected = groupItems.every(i => i.selected);
    const newSelectState = !allSelected;

    setItems(prev => prev.map(it => {
      if (it.category === cat) {
        return { ...it, selected: newSelectState };
      }
      return it;
    }));
  };

  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: prev[cat] === undefined ? false : !prev[cat]
    }));
  };

  const selectAll = (type: 'all' | 'sure' | 'none') => {
    setItems(prev => prev.map(it => ({
      ...it,
      selected: type === 'all' ? true : type === 'sure' ? it.verdict.level === 'Sure' : false
    })));
  };

  const handleExportZip = async () => {
    if (counts.selected === 0) return;
    setIsExporting(true);
    try {
      const blob = await exportOrganizedZip(items);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FileSorter_Organized_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Zip export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyPath = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  // Get matching badge theme for file extension / type
  const getBadgeStyle = (item: FileItem): { label: string; badge: BadgeTheme; icon: any } => {
    if (item.is_dir) return { label: 'Folder', badge: theme.badges.folder, icon: Folder };
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return { label: 'PDF', badge: theme.badges.pdf, icon: FileText };
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'psd', 'ai'].includes(ext)) return { label: ext.toUpperCase(), badge: theme.badges.image, icon: ImageIcon };
    if (['docx', 'doc', 'txt', 'rtf', 'xlsx', 'csv', 'pptx', 'md'].includes(ext)) return { label: ext.toUpperCase(), badge: theme.badges.document, icon: FileText };
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return { label: 'Archive', badge: theme.badges.archive, icon: FileArchive };
    if (['js', 'ts', 'tsx', 'py', 'java', 'cpp', 'html', 'css', 'json'].includes(ext)) return { label: 'Code', badge: theme.badges.code, icon: FileCode };
    if (['mp3', 'wav', 'mp4', 'mkv', 'mov'].includes(ext)) return { label: 'Media', badge: theme.badges.media, icon: FileBox };
    return { label: ext ? ext.toUpperCase() : 'File', badge: theme.badges.other, icon: FileText };
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden select-none">
      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        multiple 
        className="hidden" 
        onChange={e => e.target.files && onUploadFiles(e.target.files)} 
      />
      <input 
        type="file" 
        ref={folderInputRef} 
        // @ts-expect-error webkitdirectory
        webkitdirectory="" 
        directory="" 
        multiple 
        className="hidden" 
        onChange={e => e.target.files && onUploadFiles(e.target.files)} 
      />

      {/* Top Scope & Action Bar */}
      <div 
        className="px-6 py-3.5 border-b space-y-3 transition-colors duration-200"
        style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Scope input with soft browse pill */}
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            <span className="text-xs font-semibold shrink-0" style={{ color: theme.fg }}>
              Folder:
            </span>
            <div 
              className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-mono"
              style={{
                backgroundColor: theme.entryBg,
                borderColor: theme.entryBorder,
                color: theme.fg,
              }}
            >
              <FolderOpen className="w-4 h-4 shrink-0 opacity-70" style={{ color: theme.accent }} />
              <input
                type="text"
                value={scopePath}
                onChange={e => setScopePath(e.target.value)}
                placeholder="Target folder path..."
                className="bg-transparent border-none outline-none w-full text-xs font-mono"
                style={{ color: theme.fg }}
              />
            </div>

            <button
              onClick={() => folderInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-2xl text-xs font-semibold border flex items-center gap-1.5 shrink-0 transition-all hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: theme.buttonBg,
                borderColor: theme.panelBorder,
                color: theme.fg,
              }}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Browse</span>
            </button>
          </div>

          {/* Preset Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: theme.fg_muted }}>Preset:</span>
            <select
              onChange={e => onLoadPreset(e.target.value)}
              className="px-3 py-1.5 rounded-2xl border text-xs font-semibold outline-none cursor-pointer"
              style={{
                backgroundColor: theme.entryBg,
                borderColor: theme.entryBorder,
                color: theme.fg,
              }}
              defaultValue="downloads"
            >
              <option value="downloads">Messy Downloads (Mockup Bundle)</option>
              <option value="minecraft">Minecraft & Gaming</option>
              <option value="documents">Invoices & Research</option>
              <option value="duplicates">Duplicate Downloads</option>
            </select>
          </div>
        </div>

        {/* Primary Action Buttons & Glowing Progress Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            {/* 1. Preview Button */}
            <button
              onClick={() => onPreview('sort')}
              disabled={isLoading}
              className="px-5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
              style={{
                background: theme.accentGradient,
                boxShadow: theme.accentGlow,
                color: theme.accent_fg,
              }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>1. Run Preview</span>
            </button>

            {/* 2. Sort Selected Button */}
            <button
              onClick={() => onSort(items.filter(i => i.selected))}
              disabled={isLoading || counts.selected === 0}
              className="px-5 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2 shadow-sm transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-40"
              style={{
                backgroundColor: counts.selected > 0 ? theme.ok : theme.buttonBg,
                borderColor: counts.selected > 0 ? theme.ok : theme.panelBorder,
                color: counts.selected > 0 ? '#ffffff' : theme.fg_muted,
              }}
            >
              <Check className="w-3.5 h-3.5" />
              <span>2. Sort Selected ({counts.selected})</span>
            </button>

            {/* Undo Button */}
            <button
              onClick={onUndoLast}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-2xl text-xs font-medium border flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: theme.buttonBg,
                borderColor: theme.panelBorder,
                color: theme.fg,
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>

            {/* Export ZIP Button */}
            <button
              onClick={handleExportZip}
              disabled={counts.selected === 0 || isExporting}
              className="px-3.5 py-2 rounded-2xl text-xs font-medium border flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: theme.buttonBg,
                borderColor: theme.panelBorder,
                color: theme.fg,
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Exporting..." : "Export ZIP"}</span>
            </button>
          </div>

          {/* Blooming Progress Bar */}
          <div className="flex items-center gap-3 shrink-0">
            {isLoading && (
              <span className="text-xs font-medium animate-pulse" style={{ color: theme.accent }}>
                {progressStage}
              </span>
            )}
            <div 
              className="w-48 h-2.5 rounded-full overflow-hidden p-0.5 border"
              style={{ backgroundColor: theme.entryBg, borderColor: theme.entryBorder }}
            >
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background: theme.storageGradient,
                }}
              />
            </div>
            <span className="text-xs font-mono font-bold w-10 text-right" style={{ color: theme.fg_muted }}>
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Filter Pills and Quick Select */}
        <div 
          className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs"
          style={{ borderColor: theme.panelBorder }}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold" style={{ color: theme.fg_muted }}>Show:</span>
            {(['all', 'sure', 'unsure', 'review'] as const).map(m => {
              const active = filterMode === m;
              return (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer"
                  style={{
                    background: active ? theme.pillActiveBg : 'transparent',
                    color: active ? theme.pillActiveFg : theme.fg_muted,
                    border: active ? `1px solid ${theme.panelBorder}` : '1px solid transparent',
                  }}
                >
                  {m === 'all' && `All (${items.length})`}
                  {m === 'sure' && `Sure (${counts.sure})`}
                  {m === 'unsure' && `Unsure (${counts.unsure})`}
                  {m === 'review' && `Review (${counts.review})`}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium" style={{ color: theme.fg_subtle }}>Select:</span>
            <button
              onClick={() => selectAll('all')}
              className="text-xs font-semibold hover:underline cursor-pointer"
              style={{ color: theme.accent }}
            >
              All
            </button>
            <button
              onClick={() => selectAll('sure')}
              className="text-xs font-semibold hover:underline cursor-pointer"
              style={{ color: theme.ok }}
            >
              Sure Only
            </button>
            <button
              onClick={() => selectAll('none')}
              className="text-xs font-semibold hover:underline cursor-pointer"
              style={{ color: theme.fg_muted }}
            >
              None
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area & Collapsible Side Inspector */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Left: Main Files Area (expands to 100% when inspector is closed) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <div 
                className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center opacity-40 shadow-inner"
                style={{ backgroundColor: theme.cardBg }}
              >
                <FolderOpen className="w-8 h-8" style={{ color: theme.accent }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: theme.fg }}>
                No files found matching the current filter.
              </p>
              <p className="text-xs" style={{ color: theme.fg_muted }}>
                Click "1. Run Preview" or choose a folder preset to start organizing.
              </p>
            </div>
          ) : viewMode === 'list' ? (
            /* ========================================================
               1. LIST VIEW (Matches Mockup Image 1 & 3)
               ======================================================== */
            <div className="space-y-2">
              {filteredItems.map(item => {
                const isSelected = item.selected;
                const isActive = activeItem?.id === item.id;
                const badgeInfo = getBadgeStyle(item);
                const BadgeIcon = badgeInfo.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItemId(item.id);
                    }}
                    className="p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer group hover:scale-[1.005]"
                    style={{
                      backgroundColor: isActive ? theme.pillActiveBg : theme.cardBg,
                      borderColor: isActive ? theme.accent : theme.cardBorder,
                      boxShadow: isActive ? theme.pillActiveGlow : 'none',
                    }}
                  >
                    {/* Left: Checkbox + Icon Badge + File Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        onClick={e => toggleItemSelect(item.id, e)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4" style={{ color: theme.accent }} />
                        ) : (
                          <Square className="w-4 h-4 opacity-40" />
                        )}
                      </button>

                      {/* File Icon with Soft Blooming Category Badge */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: badgeInfo.badge.bg,
                          borderColor: badgeInfo.badge.border,
                          color: badgeInfo.badge.fg,
                        }}
                      >
                        <BadgeIcon className="w-5 h-5" />
                      </div>

                      {/* Filename & Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs tracking-tight truncate" style={{ color: theme.fg }}>
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] mt-0.5" style={{ color: theme.fg_muted }}>
                          <span>{formatBytes(item.size)}</span>
                          <span>•</span>
                          <span>Modified {new Date(item.mtime).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Category Pill Badge + Destination + Confidence */}
                    <div className="flex items-center gap-4 shrink-0">
                      {/* Destination Category Pill */}
                      <span 
                        className="px-3 py-1 rounded-full text-[11px] font-semibold border hidden sm:inline-flex items-center gap-1.5"
                        style={{
                          backgroundColor: badgeInfo.badge.bg,
                          borderColor: badgeInfo.badge.border,
                          color: badgeInfo.badge.fg,
                        }}
                      >
                        <Folder className="w-3 h-3 opacity-70" />
                        <span>{item.category}</span>
                      </span>

                      {/* Confidence Level Badge */}
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        style={{
                          backgroundColor: item.verdict.level === 'Sure' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 146, 60, 0.15)',
                          color: item.verdict.level === 'Sure' ? theme.ok : theme.warn,
                          border: `1px solid ${item.verdict.level === 'Sure' ? theme.ok : theme.warn}40`
                        }}
                      >
                        {item.verdict.level} ({Math.round(item.verdict.confidence * 100)}%)
                      </span>

                      {/* Open Inspector shortcut */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemId(item.id);
                          setShowInspector(true);
                        }}
                        title="Inspect Evidence & Path"
                        className="p-1.5 rounded-xl border opacity-60 hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: theme.buttonBg, borderColor: theme.panelBorder }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'tree' ? (
            /* ========================================================
               2. GROUPED TREE VIEW (Matches Mockup Image 2)
               ======================================================== */
            <div className="space-y-3">
              {Object.entries(filteredCategories).map(([cat, catItems]) => {
                const isExpanded = expandedCategories[cat] !== false;
                const catSize = catItems.reduce((acc, i) => acc + i.size, 0);
                const allSelected = catItems.every(i => i.selected);
                const someSelected = catItems.some(i => i.selected) && !allSelected;

                return (
                  <div 
                    key={cat} 
                    className="rounded-2xl border overflow-hidden transition-all duration-200"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    {/* Category Group Header */}
                    <div
                      onClick={() => toggleCategoryExpand(cat)}
                      className="px-4 py-3 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
                      style={{ backgroundColor: theme.panelBg2, color: theme.fg }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={e => toggleCategorySelect(cat, e)}
                          className="hover:scale-110 transition-transform cursor-pointer"
                        >
                          {allSelected ? (
                            <CheckSquare className="w-4 h-4" style={{ color: theme.accent }} />
                          ) : someSelected ? (
                            <MinusSquare className="w-4 h-4" style={{ color: theme.warn }} />
                          ) : (
                            <Square className="w-4 h-4 opacity-40" />
                          )}
                        </button>

                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 opacity-60" />
                        ) : (
                          <ChevronRight className="w-4 h-4 opacity-60" />
                        )}

                        <Folder className="w-4 h-4" style={{ color: theme.accent }} />
                        <span className="font-bold text-sm tracking-tight truncate">{cat}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span 
                          className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
                          style={{
                            backgroundColor: theme.pillActiveBg,
                            color: theme.pillActiveFg,
                            border: `1px solid ${theme.panelBorder}`
                          }}
                        >
                          {catItems.length}
                        </span>
                        <span className="text-xs font-mono opacity-70" style={{ color: theme.fg_muted }}>
                          {formatBytes(catSize)}
                        </span>
                      </div>
                    </div>

                    {/* Category Group Items */}
                    {isExpanded && (
                      <div className="p-2 space-y-1" style={{ backgroundColor: theme.panelBg }}>
                        {catItems.map(item => {
                          const isSelected = item.selected;
                          const isActive = activeItem?.id === item.id;
                          const badgeInfo = getBadgeStyle(item);
                          const BadgeIcon = badgeInfo.icon;

                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedItemId(item.id)}
                              className="px-3.5 py-2 rounded-xl flex items-center justify-between gap-3 text-xs transition-all cursor-pointer hover:scale-[1.005]"
                              style={{
                                background: isActive ? theme.pillActiveBg : 'transparent',
                                color: isActive ? theme.pillActiveFg : theme.fg,
                                border: isActive ? `1px solid ${theme.panelBorder}` : '1px solid transparent',
                              }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  onClick={e => toggleItemSelect(item.id, e)}
                                  className="cursor-pointer hover:scale-110 transition-transform"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 opacity-40" />
                                  )}
                                </button>
                                <BadgeIcon className="w-4 h-4 shrink-0" style={{ color: badgeInfo.badge.fg }} />
                                <span className="font-medium truncate">{item.name}</span>
                              </div>

                              <div className="flex items-center gap-4 text-xs shrink-0">
                                <span className="font-mono text-[11px] opacity-70">{formatBytes(item.size)}</span>
                                <span 
                                  className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold"
                                  style={{
                                    backgroundColor: item.verdict.level === 'Sure' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 146, 60, 0.15)',
                                    color: item.verdict.level === 'Sure' ? theme.ok : theme.warn,
                                  }}
                                >
                                  {item.verdict.level}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================
               3. GRID VIEW (Modern Cards)
               ======================================================== */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => {
                const isSelected = item.selected;
                const isActive = activeItem?.id === item.id;
                const badgeInfo = getBadgeStyle(item);
                const BadgeIcon = badgeInfo.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className="p-4 rounded-3xl border flex flex-col justify-between gap-4 transition-all duration-200 cursor-pointer hover:scale-[1.02] shadow-sm relative overflow-hidden"
                    style={{
                      backgroundColor: isActive ? theme.pillActiveBg : theme.cardBg,
                      borderColor: isActive ? theme.accent : theme.cardBorder,
                      boxShadow: isActive ? theme.pillActiveGlow : 'none',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm"
                        style={{
                          backgroundColor: badgeInfo.badge.bg,
                          borderColor: badgeInfo.badge.border,
                          color: badgeInfo.badge.fg,
                        }}
                      >
                        <BadgeIcon className="w-6 h-6" />
                      </div>

                      <button
                        onClick={e => toggleItemSelect(item.id, e)}
                        className="cursor-pointer hover:scale-110 transition-transform p-1"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5" style={{ color: theme.accent }} />
                        ) : (
                          <Square className="w-5 h-5 opacity-40" />
                        )}
                      </button>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs truncate" style={{ color: theme.fg }}>
                        {item.name}
                      </h4>
                      <p className="text-[11px] mt-1" style={{ color: theme.fg_muted }}>
                        {formatBytes(item.size)} • {item.category}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t" style={{ borderColor: theme.cardBorder }}>
                      <span 
                        className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px]"
                        style={{
                          backgroundColor: item.verdict.level === 'Sure' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 146, 60, 0.15)',
                          color: item.verdict.level === 'Sure' ? theme.ok : theme.warn,
                        }}
                      >
                        {item.verdict.level}
                      </span>
                      <span className="text-[10px]" style={{ color: theme.fg_subtle }}>
                        {new Date(item.mtime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            THE USER'S CORE REQUEST:
            COLLAPSIBLE / SWIPEABLE SIDE INFO & INSPECTOR PANE
            "chupana dikhana aise aise detailings jo worth it hon"
            ======================================================== */}
        {showInspector && activeItem && (
          <aside 
            className="w-80 md:w-96 shrink-0 border-l p-5 flex flex-col justify-between overflow-y-auto glass-panel select-none transition-all duration-300"
            style={{
              backgroundColor: theme.sidebarBg,
              borderColor: theme.sidebarBorder,
              boxShadow: theme.windowShadow,
            }}
          >
            <div className="space-y-5">
              {/* Top Inspector Header with Close Button */}
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: theme.panelBorder }}>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" style={{ color: theme.accent }} />
                  <span className="font-bold text-xs tracking-tight" style={{ color: theme.fg }}>
                    File Details & Evidence
                  </span>
                </div>
                <button
                  onClick={() => setShowInspector(false)}
                  title="Close Inspector (Hide side info)"
                  className="p-1.5 rounded-xl border opacity-70 hover:opacity-100 hover:scale-105 transition-all cursor-pointer"
                  style={{ backgroundColor: theme.buttonBg, borderColor: theme.panelBorder }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Large File Avatar & Name Card */}
              <div 
                className="p-4 rounded-3xl border space-y-3 relative overflow-hidden"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                }}
              >
                <div className="flex items-center gap-3.5">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-md"
                    style={{
                      backgroundColor: getBadgeStyle(activeItem).badge.bg,
                      borderColor: getBadgeStyle(activeItem).badge.border,
                      color: getBadgeStyle(activeItem).badge.fg,
                    }}
                  >
                    {React.createElement(getBadgeStyle(activeItem).icon, { className: "w-6 h-6" })}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs tracking-tight break-all" style={{ color: theme.fg }}>
                      {activeItem.name}
                    </h3>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: theme.fg_muted }}>
                      {formatBytes(activeItem.size)} • {activeItem.is_dir ? 'Directory' : 'File'}
                    </p>
                  </div>
                </div>

                {/* Confidence Gauge */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium" style={{ color: theme.fg_muted }}>Classification Confidence</span>
                    <span 
                      className="font-mono font-bold text-xs"
                      style={{ color: activeItem.verdict.level === 'Sure' ? theme.ok : theme.warn }}
                    >
                      {activeItem.verdict.level} ({Math.round(activeItem.verdict.confidence * 100)}%)
                    </span>
                  </div>
                  <div 
                    className="w-full h-2 rounded-full overflow-hidden p-0.5 border"
                    style={{ backgroundColor: theme.entryBg, borderColor: theme.entryBorder }}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${activeItem.verdict.confidence * 100}%`,
                        background: activeItem.verdict.level === 'Sure' 
                          ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' 
                          : 'linear-gradient(90deg, #f59e0b 0%, #fb923c 100%)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Destination Path Preview with Copy Button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold" style={{ color: theme.fg_muted }}>
                  <span>Organized Destination</span>
                  <button
                    onClick={() => handleCopyPath(`${destPath || scopePath || 'Downloads'}/${activeItem.verdict.path}/${activeItem.name}`)}
                    className="flex items-center gap-1 text-[11px] hover:underline cursor-pointer"
                    style={{ color: theme.accent }}
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedPath ? 'Copied!' : 'Copy Path'}</span>
                  </button>
                </div>
                <div 
                  className="p-3 rounded-2xl border text-xs font-mono break-all flex items-start gap-2 shadow-inner"
                  style={{
                    backgroundColor: theme.entryBg,
                    borderColor: theme.entryBorder,
                    color: theme.accent,
                  }}
                >
                  <FolderOpen className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {(destPath || scopePath || 'Downloads')}/{activeItem.verdict.path}/{activeItem.name}
                  </span>
                </div>
              </div>

              {/* Transparent Evidence Chain ("Why this was sorted here") */}
              <div className="space-y-2">
                <div className="text-xs font-semibold" style={{ color: theme.fg }}>
                  Reasoning & Evidence Chain:
                </div>
                <div 
                  className="p-3.5 rounded-2xl border space-y-2 text-xs"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                  }}
                >
                  {activeItem.verdict.evidence.length === 0 ? (
                    <p className="italic opacity-60 text-[11px]">No explicit rule matched; classified via fallback.</p>
                  ) : (
                    activeItem.verdict.evidence.map((ev, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: theme.ok }} />
                        <span className="leading-relaxed text-[11px]" style={{ color: theme.fg }}>{ev}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Detailed File Specs */}
              <div 
                className="p-3.5 rounded-2xl border grid grid-cols-2 gap-2 text-[11px]"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                }}
              >
                <div>
                  <span className="block opacity-60">Original Source:</span>
                  <span className="font-mono truncate block" style={{ color: theme.fg }}>{activeItem.source}</span>
                </div>
                <div>
                  <span className="block opacity-60">Last Modified:</span>
                  <span className="font-mono block" style={{ color: theme.fg }}>
                    {new Date(activeItem.mtime).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="pt-4 border-t space-y-2" style={{ borderColor: theme.panelBorder }}>
              <button
                onClick={() => toggleItemSelect(activeItem.id)}
                className="w-full py-2 px-3 rounded-2xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
                style={{
                  backgroundColor: activeItem.selected ? theme.buttonBg : theme.accent,
                  borderColor: theme.panelBorder,
                  color: activeItem.selected ? theme.fg : '#ffffff',
                }}
              >
                {activeItem.selected ? "Exclude from Sorting" : "Include in Sorting"}
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Status bar */}
      <footer 
        className="px-6 py-2.5 border-t flex items-center justify-between text-xs transition-colors duration-200"
        style={{ backgroundColor: theme.panelBg2, borderColor: theme.panelBorder, color: theme.fg_muted }}
      >
        <div className="flex items-center gap-3">
          <span>
            <strong style={{ color: theme.fg }}>{items.length}</strong> items total
          </span>
          <span>•</span>
          <span>
            <strong style={{ color: theme.ok }}>{counts.sure}</strong> Sure
          </span>
          <span>•</span>
          <span>
            <strong style={{ color: theme.warn }}>{counts.probably}</strong> Probably
          </span>
          <span>•</span>
          <span>
            <strong style={{ color: theme.unsure }}>{counts.unsure}</strong> Unsure
          </span>
          <span>•</span>
          <span>
            <strong style={{ color: theme.review }}>{counts.review}</strong> Review
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span>Tip: Press <strong>Ctrl+I</strong> or click <strong>Details</strong> to show/hide path details.</span>
        </div>
      </footer>
    </div>
  );
};
