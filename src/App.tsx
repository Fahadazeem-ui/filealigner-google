import React, { useState, useEffect } from 'react';
import { Header, AppMode, ViewMode } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SortView } from './components/SortView';
import { SearchView } from './components/SearchView';
import { DuplicatesView } from './components/DuplicatesView';
import { RulesView } from './components/RulesView';
import { SettingsModal } from './components/SettingsModal';
import { UndoModal } from './components/UndoModal';
import { getTheme } from './engine/themes';
import { loadSettings, saveSettings, loadUserRules, saveUserRules } from './engine/settings';
import { loadJournals, saveJournal, markJournalUndone } from './engine/journal';
import { generateSampleFiles, formatBytes } from './engine/sampleFiles';
import { classifyItem } from './engine/classifier';
import { FileItem, JournalRecord, AppSettings, UserCustomRule } from './types';
import { Sparkles, Minus, Square, X } from 'lucide-react';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [userRules, setUserRules] = useState<UserCustomRule[]>(() => loadUserRules());
  const [journals, setJournals] = useState<JournalRecord[]>(() => loadJournals());
  const [mode, setMode] = useState<AppMode>('sort');
  const [items, setItems] = useState<FileItem[]>(() => generateSampleFiles());
  const [scopePath, setScopePath] = useState<string>('C:/Users/User/Downloads');
  const [destPath, setDestPath] = useState<string>('');
  
  // View mode and Inspector panel state (User's core request: toggle swipe / show-hide info pane)
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showInspector, setShowInspector] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUndoOpen, setIsUndoOpen] = useState(false);

  // Status & Progress
  const [isLoading, setIsLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(100);
  const [progressStage, setProgressStage] = useState('Ready');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const theme = getTheme(settings.appearance.theme);

  // Save rules when changed
  useEffect(() => {
    saveUserRules(userRules);
  }, [userRules]);

  // Global Keyboard Shortcuts (Ctrl+I to toggle inspector, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setShowInspector(prev => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        setMode('sort');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        setMode('search');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        setMode('duplicates');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    showToast("Preferences updated.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Preview runner
  const handlePreview = async (sortMode: 'sort' | 'audit' = 'sort') => {
    setIsLoading(true);
    setProgressPercent(0);
    setProgressStage('Scanning directory manifests...');

    await new Promise(r => setTimeout(r, 120));
    setProgressPercent(35);
    setProgressStage('Inspecting magic bytes & MIME containers...');

    await new Promise(r => setTimeout(r, 150));
    setProgressPercent(70);
    setProgressStage('Evaluating custom rules & document taxonomy...');

    const updated: FileItem[] = [];
    for (const it of items) {
      const verdict = await classifyItem({
        name: it.name,
        source: it.source,
        size: it.size,
        is_dir: it.is_dir,
        blob: it.blob,
        userRules,
      });

      let selected = true;
      if (settings.sort.auto_select === 'none') selected = false;
      else if (settings.sort.auto_select === 'sure') selected = verdict.level === 'Sure';

      updated.push({
        ...it,
        verdict,
        category: verdict.path,
        selected,
      });
    }

    await new Promise(r => setTimeout(r, 100));
    setProgressPercent(100);
    setProgressStage('Ready');
    setIsLoading(false);
    setItems(updated);
    showToast(`Classification complete for ${updated.length} items.`);
  };

  // Sort executor
  const handleSort = (selectedItems: FileItem[]) => {
    if (selectedItems.length === 0) return;

    const count = selectedItems.length;
    const confirmType = settings.interaction.confirm_sort;
    if (confirmType === 'always' || (confirmType === 'many' && count > 50)) {
      if (!confirm(`Are you sure you want to sort and move ${count} selected item(s)?`)) {
        return;
      }
    }

    const effectiveDestRoot = destPath.trim() || scopePath.trim() || 'C:/Users/User/Downloads';
    const moved: [string, string][] = selectedItems.map(it => [
      it.source,
      `${effectiveDestRoot}/${it.verdict.path}/${it.name}`,
    ]);

    // Record undo journal
    const newJournal: JournalRecord = {
      id: `undo_${Date.now()}`,
      timestamp: Date.now(),
      scope: scopePath,
      moved,
      removed_dirs: [],
      created_dirs: Array.from(new Set(selectedItems.map(it => `${effectiveDestRoot}/${it.verdict.path}`))),
    };

    saveJournal(newJournal);
    setJournals(loadJournals());

    // Update item locations
    const movedMap = new Map(moved);
    setItems(prev => prev.map(it => {
      if (movedMap.has(it.source)) {
        return {
          ...it,
          source: movedMap.get(it.source)!,
          selected: false,
        };
      }
      return it;
    }));

    showToast(`Successfully organized ${count} file(s)! Checkpoint recorded in Undo Journal.`);
  };

  // Undo execution
  const handleUndoLast = () => {
    if (journals.length === 0) {
      showToast("No sort journal records found to undo.");
      return;
    }

    const latest = journals.find(j => !j.undone) || journals[0];
    if (settings.interaction.confirm_undo) {
      if (!confirm(`Rollback ${latest.moved.length} item(s) from sort run at ${new Date(latest.timestamp).toLocaleTimeString()}?`)) {
        return;
      }
    }

    const reverseMap = new Map(latest.moved.map(([src, dst]) => [dst, src]));
    setItems(prev => prev.map(it => {
      if (reverseMap.has(it.source)) {
        return {
          ...it,
          source: reverseMap.get(it.source)!,
          selected: true,
        };
      }
      return it;
    }));

    markJournalUndone(latest.id);
    setJournals(loadJournals());
    showToast(`Rolled back ${latest.moved.length} item(s) to original location.`);
  };

  const handleRevertJournal = (journalId: string) => {
    const journal = journals.find(j => j.id === journalId);
    if (!journal) return;

    const reverseMap = new Map(journal.moved.map(([src, dst]) => [dst, src]));
    setItems(prev => prev.map(it => {
      if (reverseMap.has(it.source)) {
        return {
          ...it,
          source: reverseMap.get(it.source)!,
          selected: true,
        };
      }
      return it;
    }));

    markJournalUndone(journal.id);
    setJournals(loadJournals());
    showToast(`Restored journal run (${journal.moved.length} files).`);
  };

  // Preset loader
  const handleLoadPreset = (presetName: string) => {
    const samples = generateSampleFiles();
    if (presetName === 'minecraft') {
      setScopePath('C:/Users/User/.minecraft/mods_and_plugins');
      setItems(samples.filter(i => i.category.includes('Minecraft') || i.category.includes('Games')));
    } else if (presetName === 'documents') {
      setScopePath('C:/Users/User/Documents/Unsorted');
      setItems(samples.filter(i => i.category.includes('Documents')));
    } else if (presetName === 'duplicates') {
      setScopePath('C:/Users/User/Downloads/Duplicates_Test');
      setItems(samples.filter(i => i.name.includes('filealigner') || i.name.includes('Screenshot')));
    } else {
      setScopePath('C:/Users/User/Downloads');
      setItems(samples);
    }
    showToast(`Loaded ${presetName} preset.`);
  };

  // User upload files
  const handleUploadFiles = async (files: FileList) => {
    const list: FileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const relPath = (f as any).webkitRelativePath || f.name;
      list.push({
        id: `upload-${Date.now()}-${i}`,
        name: f.name,
        source: `/${relPath}`,
        size: f.size,
        mtime: f.lastModified,
        is_dir: false,
        selected: true,
        blob: f,
        category: 'Review/Unidentified',
        verdict: {
          dest: ['Review', 'Unidentified'],
          label: f.name,
          confidence: 0.5,
          evidence: ['Imported via file picker'],
          level: 'Probably',
          path: 'Review/Unidentified',
        }
      });
    }

    if (list.length > 0) {
      setItems(list);
      setScopePath((files[0] as any).webkitRelativePath ? 'Imported Directory' : 'Imported Files');
      showToast(`Imported ${list.length} files. Starting preview...`);
      setTimeout(() => {
        handlePreview('sort');
      }, 100);
    }
  };

  const handleRemoveDuplicates = (deleteIds: string[]) => {
    const delSet = new Set(deleteIds);
    setItems(prev => prev.filter(it => !delSet.has(it.id)));
    showToast(`Cleaned ${deleteIds.length} duplicate file(s).`);
  };

  const totalSizeFormatted = formatBytes(items.reduce((acc, i) => acc + i.size, 0));

  // GUI scale
  const scalePct = settings.appearance.gui_scale || 100;
  const zoomFactor = scalePct / 100;

  return (
    <div 
      className="relative flex items-center justify-center min-h-screen w-screen p-3 md:p-6 lg:p-8 overflow-hidden select-none"
      style={{
        background: theme.canvasGradients,
        backgroundColor: theme.canvasBg,
        color: theme.fg,
        zoom: zoomFactor !== 1 ? zoomFactor : undefined,
      }}
    >
      {/* Background Animated Blooming Ambient Orbs */}
      <div 
        className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none animate-bloom-1"
        style={{ backgroundColor: theme.bloomOrb1 }}
      />
      <div 
        className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none animate-bloom-2"
        style={{ backgroundColor: theme.bloomOrb2 }}
      />
      <div 
        className="absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none animate-bloom-1"
        style={{ backgroundColor: theme.bloomOrb3 }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className="fixed bottom-8 right-8 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 glass-panel animate-bounce"
          style={{
            backgroundColor: theme.panelBg,
            borderColor: theme.accent,
            color: theme.fg,
            boxShadow: theme.accentGlow,
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accent }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          THE FLOATING FROSTED GLASS DESKTOP WINDOW CONTAINER
          (Exact replica of the mockups with rounded corners & glow)
          ======================================================== */}
      <div 
        className="relative z-10 w-full max-w-[1520px] h-[92vh] rounded-[32px] border flex flex-col overflow-hidden glass-panel"
        style={{
          backgroundColor: theme.windowBg,
          borderColor: theme.windowBorder,
          boxShadow: theme.windowShadow,
        }}
      >
        {/* Sleek Window Titlebar */}
        <div 
          className="h-9 px-5 border-b flex items-center justify-between shrink-0 select-none"
          style={{
            backgroundColor: theme.sidebarBg,
            borderColor: theme.sidebarBorder,
          }}
        >
          {/* macOS / Windows style window control dots */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer" />
          </div>

          <div className="text-[11px] font-semibold opacity-70 tracking-tight" style={{ color: theme.fg }}>
            FileSorter 5.0 • Aurora Glass Edition
          </div>

          <div className="text-[10px] font-mono opacity-50">
            Engine v8
          </div>
        </div>

        {/* Window Inner Body: Left Sidebar + Right Workspace Canvas */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <Sidebar
            mode={mode}
            setMode={setMode}
            theme={theme}
            themeKey={settings.appearance.theme}
            setThemeKey={k => {
              const next = { ...settings, appearance: { ...settings.appearance, theme: k } };
              setSettings(next);
              saveSettings(next);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenUndo={() => setIsUndoOpen(true)}
            undoCount={journals.filter(j => !j.undone).length}
            onQuickOrganize={() => handlePreview('sort')}
            onNewFolder={() => showToast("Select or browse target directory.")}
            totalItemsCount={items.length}
            totalSizeFormatted={totalSizeFormatted}
          />

          {/* Right Workspace Main Column */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Top Toolbar / Mode Switcher */}
            <Header
              mode={mode}
              setMode={setMode}
              theme={theme}
              themeKey={settings.appearance.theme}
              setThemeKey={k => {
                const next = { ...settings, appearance: { ...settings.appearance, theme: k } };
                setSettings(next);
                saveSettings(next);
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenUndo={() => setIsUndoOpen(true)}
              undoCount={journals.filter(j => !j.undone).length}
              viewMode={viewMode}
              setViewMode={setViewMode}
              showInspector={showInspector}
              setShowInspector={setShowInspector}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {/* View Containers */}
            <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {mode === 'sort' && (
                <SortView
                  theme={theme}
                  settings={settings}
                  items={items}
                  setItems={setItems}
                  scopePath={scopePath}
                  setScopePath={setScopePath}
                  destPath={destPath}
                  setDestPath={setDestPath}
                  onPreview={handlePreview}
                  onSort={handleSort}
                  onUndoLast={handleUndoLast}
                  onLoadPreset={handleLoadPreset}
                  onUploadFiles={handleUploadFiles}
                  isLoading={isLoading}
                  progressPercent={progressPercent}
                  progressStage={progressStage}
                  viewMode={viewMode}
                  showInspector={showInspector}
                  setShowInspector={setShowInspector}
                  searchQuery={searchQuery}
                />
              )}

              {mode === 'search' && (
                <SearchView
                  theme={theme}
                  settings={settings}
                  items={items}
                  scopePath={scopePath}
                />
              )}

              {mode === 'duplicates' && (
                <DuplicatesView
                  theme={theme}
                  items={items}
                  onRemoveDuplicates={handleRemoveDuplicates}
                />
              )}

              {mode === 'audit' && (
                <SortView
                  theme={theme}
                  settings={settings}
                  items={items}
                  setItems={setItems}
                  scopePath={scopePath}
                  setScopePath={setScopePath}
                  destPath={destPath}
                  setDestPath={setDestPath}
                  onPreview={() => handlePreview('audit')}
                  onSort={handleSort}
                  onUndoLast={handleUndoLast}
                  onLoadPreset={handleLoadPreset}
                  onUploadFiles={handleUploadFiles}
                  isLoading={isLoading}
                  progressPercent={progressPercent}
                  progressStage={progressStage}
                  viewMode={viewMode}
                  showInspector={showInspector}
                  setShowInspector={setShowInspector}
                  searchQuery={searchQuery}
                  auditModeOnly={true}
                />
              )}

              {mode === 'rules' && (
                <RulesView
                  theme={theme}
                  userRules={userRules}
                  setUserRules={setUserRules}
                />
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        theme={theme}
      />

      {/* Undo Modal */}
      <UndoModal
        isOpen={isUndoOpen}
        onClose={() => setIsUndoOpen(false)}
        journals={journals}
        onRevertJournal={handleRevertJournal}
        theme={theme}
      />
    </div>
  );
};

export default App;
