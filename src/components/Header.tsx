import React from 'react';
import { ThemeColors } from '../engine/themes';
import { 
  FolderSync, 
  Search, 
  List, 
  FolderTree, 
  LayoutGrid, 
  PanelRightClose, 
  PanelRightOpen, 
  SlidersHorizontal,
  Plus,
  Sparkles
} from 'lucide-react';

export type AppMode = 'sort' | 'search' | 'duplicates' | 'audit' | 'rules';
export type ViewMode = 'list' | 'tree' | 'grid';

interface HeaderProps {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  theme: ThemeColors;
  themeKey: string;
  setThemeKey: (t: 'aurora_cool' | 'aurora_warm' | 'aurora_night') => void;
  onOpenSettings: () => void;
  onOpenUndo: () => void;
  undoCount: number;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  showInspector: boolean;
  setShowInspector: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNewFolder?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  theme,
  viewMode,
  setViewMode,
  showInspector,
  setShowInspector,
  searchQuery,
  setSearchQuery,
  onNewFolder,
}) => {
  return (
    <header 
      className="px-6 py-4 flex items-center justify-between gap-4 border-b select-none transition-colors duration-300"
      style={{
        backgroundColor: theme.panelBg,
        borderColor: theme.panelBorder,
        color: theme.fg,
      }}
    >
      {/* Left: Section Title & Quick Info */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: theme.fg }}>
            {mode === 'sort' && 'Sort & Preview'}
            {mode === 'search' && 'Deep Content Search'}
            {mode === 'duplicates' && 'Smart Duplicate Cleanup'}
            {mode === 'audit' && 'Structure Audit'}
            {mode === 'rules' && 'Custom Rules Engine'}
          </h1>
          <p className="text-[11px] font-medium" style={{ color: theme.fg_muted }}>
            {mode === 'sort' && 'Automatic file classification with transparent evidence'}
            {mode === 'search' && 'Find by underlying signatures, keywords, and true file types'}
            {mode === 'duplicates' && 'Near-duplicate & versioned file detection'}
            {mode === 'audit' && 'Verify and correct misfiled taxonomy documents'}
            {mode === 'rules' && 'Define high-priority regex patterns and extensions'}
          </p>
        </div>
      </div>

      {/* Center: Signature Blooming Segmented Pill [ Sort | Search ] */}
      <div 
        className="p-1 rounded-full border flex items-center shadow-inner"
        style={{
          backgroundColor: theme.entryBg,
          borderColor: theme.entryBorder,
        }}
      >
        <button
          onClick={() => setMode('sort')}
          className="flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer"
          style={{
            background: mode === 'sort' ? theme.pillActiveBg : 'transparent',
            color: mode === 'sort' ? theme.pillActiveFg : theme.fg_muted,
            boxShadow: mode === 'sort' ? theme.pillActiveGlow : 'none',
          }}
        >
          <FolderSync className="w-3.5 h-3.5" />
          <span>Sort</span>
        </button>

        <button
          onClick={() => setMode('search')}
          className="flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer"
          style={{
            background: mode === 'search' ? theme.pillActiveBg : 'transparent',
            color: mode === 'search' ? theme.pillActiveFg : theme.fg_muted,
            boxShadow: mode === 'search' ? theme.pillActiveGlow : 'none',
          }}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
      </div>

      {/* Right: Quick Search, View Mode Toggles, and Inspector Drawer Switch */}
      <div className="flex items-center gap-2.5">
        {/* Soft Search Input Pill */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3.5 opacity-50" style={{ color: theme.fg }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search files and folders..."
            className="pl-9 pr-4 py-1.5 rounded-full text-xs font-medium border outline-none transition-all w-48 md:w-56 focus:w-64"
            style={{
              backgroundColor: theme.entryBg,
              borderColor: theme.entryBorder,
              color: theme.fg,
            }}
          />
        </div>

        {/* View Mode Switcher: List, Tree, Grid */}
        <div 
          className="p-1 rounded-2xl border flex items-center gap-0.5"
          style={{
            backgroundColor: theme.buttonBg,
            borderColor: theme.panelBorder,
          }}
        >
          <button
            onClick={() => setViewMode('list')}
            title="List View"
            className="p-1.5 rounded-xl transition-all cursor-pointer"
            style={{
              background: viewMode === 'list' ? theme.pillActiveBg : 'transparent',
              color: viewMode === 'list' ? theme.pillActiveFg : theme.fg_muted,
            }}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('tree')}
            title="Grouped Tree View"
            className="p-1.5 rounded-xl transition-all cursor-pointer"
            style={{
              background: viewMode === 'tree' ? theme.pillActiveBg : 'transparent',
              color: viewMode === 'tree' ? theme.pillActiveFg : theme.fg_muted,
            }}
          >
            <FolderTree className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            title="Grid Cards View"
            className="p-1.5 rounded-xl transition-all cursor-pointer"
            style={{
              background: viewMode === 'grid' ? theme.pillActiveBg : 'transparent',
              color: viewMode === 'grid' ? theme.pillActiveFg : theme.fg_muted,
            }}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User's Core Request: Collapsible Side Info / Inspector Pane Toggle */}
        <button
          onClick={() => setShowInspector(prev => !prev)}
          title={showInspector ? "Hide Details & Path Panel (Toggle swipe)" : "Show Details & Path Panel"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all duration-200 cursor-pointer hover:scale-105"
          style={{
            background: showInspector ? theme.pillActiveBg : theme.buttonBg,
            borderColor: theme.panelBorder,
            color: showInspector ? theme.pillActiveFg : theme.fg,
            boxShadow: showInspector ? theme.pillActiveGlow : 'none',
          }}
        >
          {showInspector ? (
            <>
              <PanelRightClose className="w-4 h-4" />
              <span className="hidden sm:inline">Hide Info</span>
            </>
          ) : (
            <>
              <PanelRightOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Details</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
