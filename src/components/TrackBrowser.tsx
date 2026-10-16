import React, { useState, useEffect, useRef } from 'react';
import { Track, SavedPlaylist } from '../types/dj';
import {
  Folder,
  Music,
  Upload,
  Search,
  Plus,
  Flame,
  Layers,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  BookmarkPlus,
  Save,
  Check,
  ListMusic,
  Trash2,
  FileAudio,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  History,
  Clock,
  Zap,
  Radio,
  Star,
  Shuffle,
  Keyboard,
  Download,
  Disc3,
  LayoutGrid,
  Maximize2,
  Minimize2,
  EyeOff,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { decodeCustomAudioFile } from '../data/defaultTracks';
import { DjMode, BrowserViewMode } from '../types/dj';
import { SplitterBar } from './SplitterBar';

// Helper for Camelot wheel neighbors harmonic mixing (Same key, +/- 1 hour, Major/Minor relative)
export function getCamelotNeighbors(camelot: string): string[] {
  if (!camelot) return [];
  const match = camelot.match(/^(\d{1,2})([ABab])$/i);
  if (!match) return [camelot.toUpperCase()];
  const num = parseInt(match[1], 10);
  const letter = match[2].toUpperCase();
  const nextNum = num === 12 ? 1 : num + 1;
  const prevNum = num === 1 ? 12 : num - 1;
  const oppositeLetter = letter === 'A' ? 'B' : 'A';
  return [
    `${num}${letter}`,
    `${nextNum}${letter}`,
    `${prevNum}${letter}`,
    `${num}${oppositeLetter}`,
  ];
}

interface TrackBrowserProps {
  tracks: Track[];
  onLoadTrack: (deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD', track: Track) => void;
  onAddCustomTrack: (track: Track) => void;
  onAddMultipleTracks?: (newTracks: Track[]) => void;
  onUpdateTracksOrder?: (reorderedTracks: Track[]) => void;
  onOpenTrackAnalysis?: (track: Track) => void;
  isQuad?: boolean;
  activeDeckTrack?: Track | null;
  activeDeckId?: 'deckA' | 'deckB';
  playedTrackIds?: string[];
  onTriggerAutoMix?: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  isRecording?: boolean;
  onOpenKeyboardShortcuts?: () => void;
  djMode?: DjMode;
  browserViewMode?: BrowserViewMode;
  onSetBrowserViewMode?: (mode: BrowserViewMode) => void;
  onDragTrackStart?: (track: Track) => void;
  onDragTrackEnd?: () => void;
  sidebarWidth?: number;
  onSidebarWidthChange?: (width: number) => void;
  height?: number;
}

type SortState = 'original' | 'asc' | 'desc';

const PLAYLISTS_STORAGE_KEY = 'virtuoso_dj_saved_scalette_v1';

export const TrackBrowser: React.FC<TrackBrowserProps> = ({
  tracks,
  onLoadTrack,
  onAddCustomTrack,
  onAddMultipleTracks,
  onUpdateTracksOrder,
  onOpenTrackAnalysis,
  isQuad = false,
  activeDeckTrack = null,
  activeDeckId = 'deckA',
  playedTrackIds = [],
  onTriggerAutoMix,
  onStartRecording,
  onStopRecording,
  isRecording = false,
  onOpenKeyboardShortcuts,
  djMode = 'essential',
  browserViewMode = 'standard',
  onSetBrowserViewMode,
  onDragTrackStart,
  onDragTrackEnd,
  sidebarWidth: controlledSidebarWidth,
  onSidebarWidthChange,
  height,
}) => {
  const [selectedCrate, setSelectedCrate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minBpmInput, setMinBpmInput] = useState<string>('');
  const [maxBpmInput, setMaxBpmInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [highlightedTrackId, setHighlightedTrackId] = useState<string | null>(null);

  // Sidebar width resizing state
  const [internalSidebarWidth, setInternalSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('virtuoso_browser_sidebar_width');
      return saved ? Math.max(160, Math.min(480, Number(saved))) : 240;
    } catch {
      return 240;
    }
  });
  const sidebarWidth = controlledSidebarWidth !== undefined ? controlledSidebarWidth : internalSidebarWidth;
  const [isResizingSidebar, setIsResizingSidebar] = useState<boolean>(false);

  const handleSidebarSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
    const startX = e.clientX;
    const startW = sidebarWidth;

    const onMouseMove = (moveEvt: MouseEvent) => {
      const delta = moveEvt.clientX - startX;
      const newW = Math.max(150, Math.min(480, Math.round(startW + delta)));
      if (onSidebarWidthChange) {
        onSidebarWidthChange(newW);
      } else {
        setInternalSidebarWidth(newW);
      }
      try {
        localStorage.setItem('virtuoso_browser_sidebar_width', String(newW));
      } catch {}
    };

    const onMouseUp = () => {
      setIsResizingSidebar(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleSidebarSplitterReset = () => {
    if (onSidebarWidthChange) {
      onSidebarWidthChange(240);
    } else {
      setInternalSidebarWidth(240);
    }
    try {
      localStorage.setItem('virtuoso_browser_sidebar_width', '240');
    } catch {}
  };

  // Drag and drop reordering state
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null);
  const [dragOverTrackId, setDragOverTrackId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  // 3-way toggle sort state: original -> asc -> desc -> original
  const [bpmSortState, setBpmSortState] = useState<SortState>('original');

  // Baseline insertion order reference: tracks indexed in the exact order they were inserted
  const insertionOrderRef = useRef<Track[]>(tracks);

  // Keep insertion order reference updated when new tracks are added
  useEffect(() => {
    // If tracks length changed or tracks have new IDs not in insertionOrderRef, update reference
    const currentIds = new Set(insertionOrderRef.current.map((t) => t.id));
    const newItems = tracks.filter((t) => !currentIds.has(t.id));
    if (newItems.length > 0) {
      // Prepend or append depending on how new tracks were introduced
      insertionOrderRef.current = [...newItems, ...insertionOrderRef.current];
    } else if (insertionOrderRef.current.length === 0 && tracks.length > 0) {
      insertionOrderRef.current = [...tracks];
    }
  }, [tracks]);

  // Saved playlists / scalette state
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>(() => {
    try {
      const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse saved playlists:', e);
    }
    // Default preset scalette for inspiration
    return [
      {
        id: 'scaletta-peak-energy',
        name: '🔥 Peak Time Festival Set (126-140 BPM)',
        createdAt: Date.now() - 86400000,
        trackIds: ['track-1', 'track-2', 'track-3', 'track-4'],
        trackCount: 4,
        notes: 'Progressione ideale da Tech House fino a DnB Peak Energy',
      },
    ];
  });

  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  // Save playlists to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(savedPlaylists));
    } catch (e) {
      console.error('Error saving playlists to storage:', e);
    }
  }, [savedPlaylists]);

  // Multi-state button click handler:
  // 'original' -> 'asc' (BPM crescente) -> 'desc' (BPM decrescente) -> 'original' (sequenza originale di inserimento)
  const handleCycleBpmSort = () => {
    let nextSort: SortState = 'original';
    if (bpmSortState === 'original') {
      nextSort = 'asc';
    } else if (bpmSortState === 'asc') {
      nextSort = 'desc';
    } else {
      nextSort = 'original';
    }

    setBpmSortState(nextSort);

    // If caller wants global order synchronization
    if (onUpdateTracksOrder) {
      if (nextSort === 'original') {
        onUpdateTracksOrder([...insertionOrderRef.current]);
      } else if (nextSort === 'asc') {
        const sorted = [...tracks].sort((a, b) => a.bpm - b.bpm);
        onUpdateTracksOrder(sorted);
      } else if (nextSort === 'desc') {
        const sorted = [...tracks].sort((a, b) => b.bpm - a.bpm);
        onUpdateTracksOrder(sorted);
      }
    }
  };

  // Compute displayed tracks based on current filter, crate, and sort state
  const displayedTracks = React.useMemo(() => {
    let list: Track[] = [];

    if (activePlaylistId) {
      const pl = savedPlaylists.find((p) => p.id === activePlaylistId);
      if (pl) {
        const idMap = new Map(tracks.map((t) => [t.id, t]));
        list = pl.trackIds.map((id) => idMap.get(id)).filter(Boolean) as Track[];
      } else {
        list = [...tracks];
      }
    } else if (bpmSortState === 'original') {
      // Re-align with insertion order
      const idOrder = new Map(insertionOrderRef.current.map((t, idx) => [t.id, idx]));
      list = [...tracks].sort((a, b) => {
        const indexA = idOrder.has(a.id) ? idOrder.get(a.id)! : 999;
        const indexB = idOrder.has(b.id) ? idOrder.get(b.id)! : 999;
        return indexA - indexB;
      });
    } else if (bpmSortState === 'asc') {
      list = [...tracks].sort((a, b) => a.bpm - b.bpm);
    } else if (bpmSortState === 'desc') {
      list = [...tracks].sort((a, b) => b.bpm - a.bpm);
    } else {
      list = [...tracks];
    }

    // Filter by crate
    if (selectedCrate === 'house') {
      list = list.filter((t) => t.genre.toLowerCase().includes('house'));
    } else if (selectedCrate === 'bass') {
      list = list.filter(
        (t) => t.genre.toLowerCase().includes('trap') || t.genre.toLowerCase().includes('dnb')
      );
    } else if (selectedCrate === 'custom') {
      list = list.filter((t) => !!t.isCustom);
    } else if (selectedCrate === 'energy') {
      list = list.filter((t) => (t.energy || 5) >= 8);
    } else if (selectedCrate === 'history') {
      if (playedTrackIds && playedTrackIds.length > 0) {
        list = list.filter((t) => playedTrackIds.includes(t.id));
      } else {
        list = [];
      }
    } else if (selectedCrate === 'harmonic') {
      if (activeDeckTrack) {
        const rawCode =
          activeDeckTrack.camelotCode ||
          activeDeckTrack.key.match(/\d{1,2}[ABab]/i)?.[0] ||
          '';
        if (rawCode) {
          const neighbors = getCamelotNeighbors(rawCode);
          list = list.filter((t) => {
            const tCode = (
              t.camelotCode ||
              t.key.match(/\d{1,2}[ABab]/i)?.[0] ||
              ''
            ).toUpperCase();
            return neighbors.includes(tCode);
          });
        }
      }
    }

    // Determine effective BPM range bounds from input fields and/or search text query
    let parsedMinBpm: number | null = minBpmInput.trim() !== '' ? parseFloat(minBpmInput) : null;
    let parsedMaxBpm: number | null = maxBpmInput.trim() !== '' ? parseFloat(maxBpmInput) : null;

    let textQuery = searchQuery.trim();

    // Smart detection: check if user typed a BPM range expression into the search box
    // Examples: "120-130", "124 - 128", "128..140", ">=125", "<=130", ">120", "<135"
    const rangeMatch = textQuery.match(/(\d{2,3}(?:\.\d+)?)\s*(?:-|–|\.\.)\s*(\d{2,3}(?:\.\d+)?)/);
    if (rangeMatch) {
      const v1 = parseFloat(rangeMatch[1]);
      const v2 = parseFloat(rangeMatch[2]);
      parsedMinBpm = Math.min(v1, v2);
      parsedMaxBpm = Math.max(v1, v2);
      textQuery = textQuery.replace(rangeMatch[0], '').trim();
    } else {
      const gteMatch = textQuery.match(/(?:>=|>)\s*(\d{2,3}(?:\.\d+)?)/);
      if (gteMatch) {
        parsedMinBpm = parseFloat(gteMatch[1]);
        textQuery = textQuery.replace(gteMatch[0], '').trim();
      }
      const lteMatch = textQuery.match(/(?:<=|<)\s*(\d{2,3}(?:\.\d+)?)/);
      if (lteMatch) {
        parsedMaxBpm = parseFloat(lteMatch[1]);
        textQuery = textQuery.replace(lteMatch[0], '').trim();
      }
    }

    // Filter by text query (Title, Artist, Genre, Key, or exact BPM)
    if (textQuery) {
      const q = textQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q) ||
          t.key.toLowerCase().includes(q) ||
          t.bpm.toString().includes(q)
      );
    }

    // Filter by BPM range
    if (parsedMinBpm !== null && !isNaN(parsedMinBpm)) {
      list = list.filter((t) => t.bpm >= parsedMinBpm! - 0.05);
    }
    if (parsedMaxBpm !== null && !isNaN(parsedMaxBpm)) {
      list = list.filter((t) => t.bpm <= parsedMaxBpm! + 0.05);
    }

    return list;
  }, [
    tracks,
    bpmSortState,
    activePlaylistId,
    savedPlaylists,
    selectedCrate,
    searchQuery,
    minBpmInput,
    maxBpmInput,
    activeDeckTrack,
    playedTrackIds,
  ]);

  // Reorder function (used by drag-and-drop and manual arrow buttons)
  const handleReorderTrack = (sourceId: string, targetId: string, position: 'before' | 'after') => {
    if (sourceId === targetId) return;

    if (activePlaylistId) {
      const pl = savedPlaylists.find((p) => p.id === activePlaylistId);
      if (!pl) return;
      const trackIds = [...pl.trackIds];
      const sourceIdx = trackIds.indexOf(sourceId);
      const targetIdx = trackIds.indexOf(targetId);
      if (sourceIdx === -1 || targetIdx === -1) return;

      trackIds.splice(sourceIdx, 1);
      const insertIdx = position === 'before'
        ? (sourceIdx < targetIdx ? targetIdx - 1 : targetIdx)
        : (sourceIdx < targetIdx ? targetIdx : targetIdx + 1);

      trackIds.splice(insertIdx, 0, sourceId);

      setSavedPlaylists((prev) =>
        prev.map((p) => (p.id === activePlaylistId ? { ...p, trackIds } : p))
      );
      setSaveSuccessToast('Brano riposizionato nella scaletta');
      setTimeout(() => setSaveSuccessToast(null), 2500);
      return;
    }

    // Reorder in master tracks list
    const baseList = bpmSortState === 'original' ? [...insertionOrderRef.current] : [...displayedTracks];
    const sourceIdx = baseList.findIndex((t) => t.id === sourceId);
    const targetIdx = baseList.findIndex((t) => t.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const [moved] = baseList.splice(sourceIdx, 1);
    const insertIdx = position === 'before'
      ? (sourceIdx < targetIdx ? targetIdx - 1 : targetIdx)
      : (sourceIdx < targetIdx ? targetIdx : targetIdx + 1);

    baseList.splice(insertIdx, 0, moved);

    // Merge any missing tracks (if filtered by crate or search)
    const baseIds = new Set(baseList.map((t) => t.id));
    const fullOrder = [...baseList, ...tracks.filter((t) => !baseIds.has(t.id))];

    insertionOrderRef.current = [...fullOrder];
    setBpmSortState('original');

    if (onUpdateTracksOrder) {
      onUpdateTracksOrder(fullOrder);
    }

    setSaveSuccessToast(`Brano riposizionato (#${insertIdx + 1})`);
    setTimeout(() => setSaveSuccessToast(null), 2500);
  };

  const handleMoveStep = (e: React.MouseEvent, trackId: string, direction: 'up' | 'down') => {
    e.stopPropagation();
    const idx = displayedTracks.findIndex((t) => t.id === trackId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= displayedTracks.length) return;
    const targetTrack = displayedTracks[targetIdx];
    handleReorderTrack(trackId, targetTrack.id, direction === 'up' ? 'before' : 'after');
  };

  const handleDragStart = (e: React.DragEvent, track: Track) => {
    setDraggedTrackId(track.id);
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', track.id);
    e.dataTransfer.setData('track-id', track.id);
    e.dataTransfer.setData('application/json', JSON.stringify(track));
    onDragTrackStart?.(track);
  };

  const handleDragOver = (e: React.DragEvent, track: Track) => {
    e.preventDefault();
    if (!draggedTrackId || draggedTrackId === track.id) return;
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos: 'before' | 'after' = e.clientY < midY ? 'before' : 'after';

    if (dragOverTrackId !== track.id || dropPosition !== pos) {
      setDragOverTrackId(track.id);
      setDropPosition(pos);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientY < rect.top ||
      e.clientY > rect.bottom ||
      e.clientX < rect.left ||
      e.clientX > rect.right
    ) {
      setDragOverTrackId(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetTrack: Track) => {
    e.preventDefault();
    if (!draggedTrackId || draggedTrackId === targetTrack.id || !dropPosition) {
      setDraggedTrackId(null);
      setDragOverTrackId(null);
      setDropPosition(null);
      onDragTrackEnd?.();
      return;
    }

    handleReorderTrack(draggedTrackId, targetTrack.id, dropPosition);
    setDraggedTrackId(null);
    setDragOverTrackId(null);
    setDropPosition(null);
    onDragTrackEnd?.();
  };

  const handleDragEnd = () => {
    setDraggedTrackId(null);
    setDragOverTrackId(null);
    setDropPosition(null);
    onDragTrackEnd?.();
  };

  // Handle local files upload (Single OR Multiple Tracks simultaneously)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    const newTracksList: Track[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress({ current: i + 1, total: files.length });
        const file = files[i];
        const newTrack = await decodeCustomAudioFile(file);
        newTracksList.push(newTrack);
      }

      if (newTracksList.length > 0) {
        // Record them in insertionOrderRef maintaining the exact sequence as introduced
        insertionOrderRef.current = [...newTracksList, ...insertionOrderRef.current];

        if (onAddMultipleTracks) {
          onAddMultipleTracks(newTracksList);
        } else {
          // Fallback single additions
          newTracksList.forEach((t) => onAddCustomTrack(t));
        }

        // Switch to "all" crate to view imported files immediately
        setSelectedCrate('all');
        setActivePlaylistId(null);

        // Flash toast
        setSaveSuccessToast(
          `Importati ${newTracksList.length} brani simultaneamente in scaletta!`
        );
        setTimeout(() => setSaveSuccessToast(null), 3500);
      }
    } catch (err) {
      console.error('Error importing audio file:', err);
      alert('Impossibile decodificare uno o più file audio. Formati raccomandati: MP3, WAV, AAC.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  // Save current order / scaletta to saved playlists
  const handleSaveCurrentScaletta = () => {
    if (!newPlaylistName.trim()) return;
    const currentTrackIds = displayedTracks.map((t) => t.id);

    const newPlaylist: SavedPlaylist = {
      id: `scaletta-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: newPlaylistName.trim(),
      createdAt: Date.now(),
      trackIds: currentTrackIds,
      trackCount: currentTrackIds.length,
      notes: `Ordinamento BPM: ${bpmSortState === 'asc' ? 'Crescente' : bpmSortState === 'desc' ? 'Decrescente' : 'Inserimento Iniziale'} (${currentTrackIds.length} brani)`,
    };

    setSavedPlaylists((prev) => [newPlaylist, ...prev]);
    setShowSaveModal(false);
    setNewPlaylistName('');
    setActivePlaylistId(newPlaylist.id);

    setSaveSuccessToast(`Scaletta "${newPlaylist.name}" salvata con successo!`);
    setTimeout(() => setSaveSuccessToast(null), 3500);
  };

  const handleDeletePlaylist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedPlaylists((prev) => prev.filter((p) => p.id !== id));
    if (activePlaylistId === id) {
      setActivePlaylistId(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper labels for the BPM Cycle Button
  const getBpmButtonConfig = () => {
    if (bpmSortState === 'original') {
      return {
        label: 'BPM: Inserimento',
        sublabel: 'Clicca per Crescente ↗',
        badge: 'ORDINE INIZIALE',
        icon: RotateCcw,
        border: 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300',
        activeDot: 'bg-slate-400',
      };
    }
    if (bpmSortState === 'asc') {
      return {
        label: 'BPM: Crescente ↗',
        sublabel: 'Clicca per Decrescente ↘',
        badge: 'CRESCENTE',
        icon: ArrowUp,
        border: 'border-cyan-500/80 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
        activeDot: 'bg-cyan-400 animate-pulse',
      };
    }
    return {
      label: 'BPM: Decrescente ↘',
      sublabel: 'Clicca per Ripristinare ⟲',
      badge: 'DECRESCENTE',
      icon: ArrowDown,
      border: 'border-amber-500/80 bg-amber-950/90 hover:bg-amber-900 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      activeDot: 'bg-amber-400 animate-pulse',
    };
  };

  const bpmBtn = getBpmButtonConfig();
  const BpmIcon = bpmBtn.icon;

  const containerStyle: React.CSSProperties =
    browserViewMode === 'maximized'
      ? { flex: '1 1 0%', height: '100%', minHeight: 0 }
      : browserViewMode === 'compact'
      ? { height: '130px' }
      : browserViewMode === 'hidden'
      ? { display: 'none' }
      : { height: `${height || 175}px` };

  const isCompactHeight = (height ?? 175) < 155;

  return (
    <div
      style={containerStyle}
      className="bg-[#0f1118] border-t border-[#1e2330] flex flex-col select-none text-slate-200 relative shrink-0 transition-all duration-150"
    >
      {/* Search and Action Toolbar */}
      <div className={`flex items-center justify-between ${isCompactHeight ? 'px-2 py-1 gap-1.5 overflow-x-auto no-scrollbar' : 'flex-wrap px-3 py-1.5 gap-2'} border-b border-[#1c202a] bg-[#141722]`}>
        {/* Left: Search input field for Title, Artist, Genre, Key, or BPM */}
        <div className={`relative flex-1 ${isCompactHeight ? 'min-w-[140px] max-w-[220px]' : 'min-w-[200px] max-w-xs sm:max-w-sm'}`}>
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca titolo, artista o BPM (es. 120-130)..."
            className="w-full pl-8 pr-7 py-1 bg-[#0b0d13] border border-[#232838] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden font-sans transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              title="Azzera testo di ricerca"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* BPM Range Filter Inputs (Min - Max BPM) & Quick Presets */}
        <div className="flex items-center gap-1.5 bg-[#0b0d13] px-2 py-1 rounded border border-[#232838]">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Range BPM:</span>
            <span className="sm:hidden">BPM:</span>
          </span>
          <input
            type="number"
            value={minBpmInput}
            onChange={(e) => setMinBpmInput(e.target.value)}
            placeholder="Min"
            min={60}
            max={220}
            className="w-13 px-1 py-0.5 bg-[#141722] border border-[#2b3145] focus:border-cyan-400 rounded text-[11px] font-mono text-center text-slate-200 placeholder-slate-600 focus:outline-hidden"
            title="BPM Minimo"
          />
          <span className="text-slate-500 text-xs font-mono">-</span>
          <input
            type="number"
            value={maxBpmInput}
            onChange={(e) => setMaxBpmInput(e.target.value)}
            placeholder="Max"
            min={60}
            max={220}
            className="w-13 px-1 py-0.5 bg-[#141722] border border-[#2b3145] focus:border-cyan-400 rounded text-[11px] font-mono text-center text-slate-200 placeholder-slate-600 focus:outline-hidden"
            title="BPM Massimo"
          />
          {(minBpmInput || maxBpmInput) && (
            <button
              onClick={() => {
                setMinBpmInput('');
                setMaxBpmInput('');
              }}
              className="text-slate-400 hover:text-amber-400 p-0.5 rounded text-[10px] font-mono transition"
              title="Azzera range BPM"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Quick BPM Range Preset Buttons */}
          <div className="hidden lg:flex items-center gap-1 ml-1 pl-1 border-l border-slate-800">
            {[
              { label: '120-128', min: '120', max: '128' },
              { label: '128-135', min: '128', max: '135' },
              { label: '140-175', min: '140', max: '175' },
            ].map((p) => {
              const isSelected = minBpmInput === p.min && maxBpmInput === p.max;
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    if (isSelected) {
                      setMinBpmInput('');
                      setMaxBpmInput('');
                    } else {
                      setMinBpmInput(p.min);
                      setMaxBpmInput(p.max);
                    }
                  }}
                  className={`px-1.5 py-0.5 text-[9px] font-mono rounded border transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={`Filtra range ${p.label} BPM`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset active filters badge if search or BPM range is applied */}
        {(searchQuery || minBpmInput || maxBpmInput) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setMinBpmInput('');
              setMaxBpmInput('');
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-amber-950/70 border border-amber-500/50 text-amber-300 text-[10px] font-mono hover:bg-amber-900 transition active:scale-95 cursor-pointer"
            title="Azzera tutti i filtri di ricerca e range BPM"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Filtri attivi ({displayedTracks.length}/{tracks.length})</span>
          </button>
        )}

        {/* Center: BPM Sort Cycle Button (Original -> Ascending -> Descending -> Original) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCycleBpmSort}
            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-bold border transition active:scale-95 cursor-pointer ${bpmBtn.border}`}
            title="Premi per ordinare per BPM: Crescente -> Decrescente -> Ripristina Sequenza Iniziale"
          >
            <div className={`w-2 h-2 rounded-full ${bpmBtn.activeDot}`} />
            <BpmIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="tracking-wide">{bpmBtn.label}</span>
            <span className="hidden sm:inline-block text-[9px] font-normal opacity-70 px-1 py-0.5 rounded bg-black/40">
              {bpmBtn.sublabel}
            </span>
          </button>

          {/* Quick Save Current Scaletta Button */}
          <button
            onClick={() => {
              setNewPlaylistName(
                `Scaletta ${new Date().toLocaleDateString('it-IT')} - ${
                  bpmSortState === 'asc' ? 'BPM Crescente' : bpmSortState === 'desc' ? 'BPM Decrescente' : 'Custom'
                }`
              );
              setShowSaveModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161a26] hover:bg-[#1f2538] border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition active:scale-95 cursor-pointer shadow-sm"
            title="Salva la scaletta attuale con questo ordine personalizzato"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Salva Scaletta</span>
          </button>
        </div>

        {/* Right Section: View Mode & Upload Buttons */}
        <div className="flex items-center gap-2">
          {/* Browser View Mode Switcher (Standard, Maximize, Compact, Hide) */}
          {onSetBrowserViewMode && (
            <div className="flex items-center gap-1 bg-[#0b0d13] p-0.5 rounded border border-[#232838]">
              <button
                onClick={() => onSetBrowserViewMode('standard')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                  browserViewMode === 'standard'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Vista Standard divisa con i deck [B]"
              >
                <LayoutGrid className="w-3 h-3" />
                <span className="hidden md:inline">STANDARD</span>
              </button>
              <button
                onClick={() =>
                  onSetBrowserViewMode(
                    browserViewMode === 'maximized' ? 'standard' : 'maximized'
                  )
                }
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                  browserViewMode === 'maximized'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Espandi Browser a tutta altezza per navigare facilmente libreria e scalette [B]"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {browserViewMode === 'maximized' ? 'RIDUCI' : 'MAX BROWSER'}
                </span>
              </button>
              <button
                onClick={() =>
                  onSetBrowserViewMode(
                    browserViewMode === 'compact' ? 'standard' : 'compact'
                  )
                }
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                  browserViewMode === 'compact'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Riduci altezza browser per dare massimo spazio ai Deck e Jog Wheel"
              >
                <Minimize2 className="w-3 h-3" />
                <span className="hidden md:inline">COMPATTO</span>
              </button>
              <button
                onClick={() => onSetBrowserViewMode('hidden')}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                title="Nascondi browser per 100% altezza su Deck e Mixer per performance live"
              >
                <EyeOff className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Upload multiple audio tracks simultaneously */}
          <label className="flex items-center gap-1.5 px-3 py-1 bg-[#1e2230] hover:bg-[#282f42] border border-[#333b52] rounded text-xs font-semibold text-cyan-300 cursor-pointer transition active:scale-95 shrink-0">
            <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">
              {isUploading
                ? `Caricamento (${uploadProgress?.current}/${uploadProgress?.total})...`
                : 'Inserisci Brani'}
            </span>
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessToast && (
        <div className="absolute top-11 right-4 z-50 px-3 py-1.5 rounded-lg bg-cyan-950/95 border border-cyan-400 text-cyan-100 text-xs shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-cyan-300 shrink-0" />
          <span className="font-semibold">{saveSuccessToast}</span>
        </div>
      )}

      {/* Main Browser Content: Crates Sidebar + Track Table */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* VirtualDJ Crates & Bottom-Left Quick Shortcuts Sidebar */}
        <div
          style={{ width: isSidebarCollapsed ? undefined : `${sidebarWidth}px` }}
          className={`${
            isSidebarCollapsed ? 'w-12 sm:w-14' : ''
          } bg-[#11131c] border-r border-[#1c202a] p-1.5 flex flex-col justify-between overflow-y-auto text-xs shrink-0 transition-[width] duration-75 select-none`}
        >
          {/* Top Section: Sidebar Header & Crates List */}
          <div className="flex flex-col gap-1">
            {/* Header with Collapse/Expand Toggle */}
            <div className="flex items-center justify-between px-1 pb-1 border-b border-[#1c202a]">
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider font-bold truncate">
                    CRATES & LIBRERIA
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    ({displayedTracks.length})
                  </span>
                </div>
              )}
              <button
                onClick={() => setIsSidebarCollapsed((v) => !v)}
                className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition mx-auto cursor-pointer"
                title={isSidebarCollapsed ? 'Espandi barra laterale' : 'Comprimi barra laterale'}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronLeft className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* VirtualDJ Main Navigation Crates */}
            <div className="space-y-0.5 mt-1">
              {[
                {
                  id: 'all',
                  label: 'Tutta la Libreria',
                  icon: Music,
                  count: tracks.length,
                  badgeColor: 'text-slate-400',
                },
                {
                  id: 'harmonic',
                  label: 'Harmonic Match',
                  icon: Radio,
                  count: activeDeckTrack
                    ? tracks.filter((t) => {
                        const rawCode =
                          activeDeckTrack.camelotCode ||
                          activeDeckTrack.key.match(/\d{1,2}[ABab]/i)?.[0] ||
                          '';
                        if (!rawCode) return false;
                        const neighbors = getCamelotNeighbors(rawCode);
                        const tCode = (
                          t.camelotCode ||
                          t.key.match(/\d{1,2}[ABab]/i)?.[0] ||
                          ''
                        ).toUpperCase();
                        return neighbors.includes(tCode);
                      }).length
                    : 0,
                  sublabel: activeDeckTrack
                    ? activeDeckTrack.camelotCode || activeDeckTrack.key
                    : 'Nessun deck',
                  badgeColor: 'text-cyan-400',
                  highlight: true,
                },
                {
                  id: 'energy',
                  label: 'Top Energy / Bangers',
                  icon: Star,
                  count: tracks.filter((t) => (t.energy || 5) >= 8).length,
                  badgeColor: 'text-amber-400',
                },
                {
                  id: 'history',
                  label: 'Cronologia Mixati',
                  icon: History,
                  count: playedTrackIds.length,
                  badgeColor: 'text-cyan-400',
                },
                {
                  id: 'house',
                  label: 'House & Tech Crates',
                  icon: Layers,
                  count: tracks.filter((t) => t.genre.toLowerCase().includes('house')).length,
                  badgeColor: 'text-blue-400',
                },
                {
                  id: 'bass',
                  label: 'Trap & DnB Crates',
                  icon: Flame,
                  count: tracks.filter(
                    (t) =>
                      t.genre.toLowerCase().includes('trap') ||
                      t.genre.toLowerCase().includes('dnb')
                  ).length,
                  badgeColor: 'text-rose-400',
                },
                {
                  id: 'custom',
                  label: 'Brani Inseriti Utente',
                  icon: Folder,
                  count: tracks.filter((t) => !!t.isCustom).length,
                  badgeColor: 'text-purple-400',
                },
              ].map((crate) => {
                const Icon = crate.icon;
                const isSelected = selectedCrate === crate.id && !activePlaylistId;
                return (
                  <button
                    key={crate.id}
                    onClick={() => {
                      setSelectedCrate(crate.id);
                      setActivePlaylistId(null);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition cursor-pointer group ${
                      isSelected
                        ? 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                    }`}
                    title={`${crate.label} (${crate.count} brani)`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                        }`}
                      />
                      {!isSidebarCollapsed && (
                        <span className="truncate text-[11px]">{crate.label}</span>
                      )}
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {crate.sublabel && (
                          <span className="text-[8px] font-mono px-1 rounded bg-black/50 text-cyan-300 border border-cyan-500/30">
                            {crate.sublabel}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-mono px-1 rounded bg-slate-900/90 ${crate.badgeColor}`}
                        >
                          {crate.count}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scalette Salvate Section (Hidden when collapsed) */}
            {!isSidebarCollapsed && (
              <div className="mt-2 pt-2 border-t border-[#1f2433]">
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider font-bold flex items-center gap-1">
                    <ListMusic className="w-3 h-3 text-cyan-400" />
                    SCALETTE SALVATE
                  </span>
                  <button
                    onClick={() => {
                      setNewPlaylistName(`Scaletta Set #${savedPlaylists.length + 1}`);
                      setShowSaveModal(true);
                    }}
                    className="text-[9px] text-slate-400 hover:text-cyan-300 p-0.5 rounded hover:bg-slate-800 cursor-pointer"
                    title="Nuova scaletta"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-0.5 max-h-28 overflow-y-auto">
                  {savedPlaylists.map((pl) => {
                    const isActive = activePlaylistId === pl.id;
                    return (
                      <div
                        key={pl.id}
                        onClick={() => {
                          setActivePlaylistId(pl.id);
                        }}
                        className={`group flex items-center justify-between px-2 py-1 rounded text-left transition cursor-pointer ${
                          isActive
                            ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ListMusic className="w-3 h-3 shrink-0 text-cyan-400" />
                          <span className="truncate text-[11px]">{pl.name}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1 rounded">
                            {pl.trackCount}
                          </span>
                          <button
                            onClick={(e) => handleDeletePlaylist(e, pl.id)}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition p-0.5 text-slate-500"
                            title="Elimina scaletta"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {savedPlaylists.length === 0 && (
                    <div className="text-[10px] text-slate-600 px-2 py-1 italic">
                      Nessuna scaletta
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SPECCHIETTO IN BASSO A SINISTRA (VirtualDJ Signature Quick Shortcuts Dock) */}
          <div className="mt-3 pt-2 border-t border-[#222736] bg-[#0c0e15]/90 -mx-1.5 -mb-1.5 p-2 rounded-b flex flex-col gap-1.5">
            {!isSidebarCollapsed ? (
              <>
                <div className="flex items-center justify-between px-0.5 pb-0.5 text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>SCORCIATOIE RAPIDE</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[8px]">VDJ DOCK</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {/* 1. Quick AutoMix Live Button */}
                  <button
                    onClick={onTriggerAutoMix}
                    className="flex flex-col items-center justify-center p-1.5 rounded-md bg-gradient-to-br from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/40 text-cyan-200 text-[10px] font-mono font-bold transition active:scale-95 shadow-sm cursor-pointer text-center group"
                    title="Avvia transizione intelligente tra Deck A e Deck B"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 mb-0.5 group-hover:rotate-12 transition-transform" />
                    <span className="leading-tight">AutoMix</span>
                  </button>

                  {/* 2. Quick REC Button */}
                  <button
                    onClick={isRecording ? onStopRecording : onStartRecording}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-md border text-[10px] font-mono font-bold transition active:scale-95 shadow-sm cursor-pointer text-center ${
                      isRecording
                        ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                        : 'bg-[#181b24] hover:bg-red-950/40 border-[#30384d] hover:border-red-500/50 text-slate-300 hover:text-red-400'
                    }`}
                    title={isRecording ? 'Interrompi e salva registrazione' : 'Avvia registrazione rapida Master (WAV)'}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isRecording ? 'bg-red-500' : 'bg-red-600'
                        }`}
                      />
                      <Download className="w-3 h-3" />
                    </div>
                    <span className="leading-tight">
                      {isRecording ? 'Stop REC' : 'Quick REC'}
                    </span>
                  </button>

                  {/* 3. Mappatura Tasti HUD */}
                  <button
                    onClick={onOpenKeyboardShortcuts}
                    className="flex flex-col items-center justify-center p-1.5 rounded-md bg-[#181b24] hover:bg-[#222838] border border-[#2d3448] text-slate-300 hover:text-cyan-300 text-[10px] font-mono font-medium transition active:scale-95 cursor-pointer text-center group"
                    title="Mostra tutti i tasti rapidi da tastiera (SPACE, C, S, 1-8, ?)"
                  >
                    <Keyboard className="w-3.5 h-3.5 text-cyan-400 mb-0.5 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-1">
                      <span className="leading-tight">Tasti HUD</span>
                      <kbd className="text-[8px] px-1 rounded bg-black/60 text-cyan-300 border border-slate-700">
                        ?
                      </kbd>
                    </div>
                  </button>

                  {/* 4. Random Pick / Banger Surprise */}
                  <button
                    onClick={() => {
                      if (displayedTracks.length === 0) return;
                      const rand =
                        displayedTracks[Math.floor(Math.random() * displayedTracks.length)];
                      setHighlightedTrackId(rand.id);
                      setTimeout(() => {
                        setHighlightedTrackId((curr) => (curr === rand.id ? null : curr));
                      }, 3000);
                    }}
                    className="flex flex-col items-center justify-center p-1.5 rounded-md bg-[#181b24] hover:bg-[#222838] border border-[#2d3448] text-amber-300 hover:text-amber-200 text-[10px] font-mono font-medium transition active:scale-95 cursor-pointer text-center group"
                    title="Scegli a sorpresa una traccia adatta da questo crate"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-amber-400 mb-0.5 group-hover:rotate-45 transition-transform" />
                    <span className="leading-tight">Random Pick</span>
                  </button>
                </div>
              </>
            ) : (
              /* Collapsed Icon Bar for Quick Shortcuts */
              <div className="flex flex-col items-center gap-1.5 py-1">
                <button
                  onClick={onTriggerAutoMix}
                  className="p-2 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 transition active:scale-95 cursor-pointer"
                  title="AutoMix Rapido"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={isRecording ? onStopRecording : onStartRecording}
                  className={`p-2 rounded border transition active:scale-95 cursor-pointer ${
                    isRecording
                      ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-red-400'
                  }`}
                  title="Quick REC"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenKeyboardShortcuts}
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 transition active:scale-95 cursor-pointer"
                  title="Mappatura Tasti Rapidi"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vertical Splitter between Crates Sidebar and Tracks Table */}
        {!isSidebarCollapsed && (
          <SplitterBar
            orientation="vertical"
            isDragging={isResizingSidebar}
            onMouseDown={handleSidebarSplitterMouseDown}
            onDoubleClick={handleSidebarSplitterReset}
            onReset={handleSidebarSplitterReset}
            label="Trascina in orizzontale per allargare la barra Crates • Doppio click per default (240px)"
          />
        )}

        {/* Tracks Table */}
        <div className="flex-1 overflow-y-auto">
          {/* Active Playlist Header indicator if viewing a saved playlist */}
          {activePlaylistId && (
            <div className="bg-[#131722] border-b border-[#222838] px-3 py-1 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-cyan-300">
                <ListMusic className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">
                  Scaletta attiva:{' '}
                  {savedPlaylists.find((p) => p.id === activePlaylistId)?.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({displayedTracks.length} tracce)
                </span>
              </div>
              <button
                onClick={() => setActivePlaylistId(null)}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
              >
                Torna a tutti i brani
              </button>
            </div>
          )}

          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#141722] border-b border-[#222736] text-[10px] font-mono text-slate-400 uppercase z-10">
              <tr>
                <th className="py-1 px-2 w-14 text-center" title="Trascina l'icona con le righe per spostare i brani">
                  <div className="flex items-center justify-center gap-0.5">
                    <GripVertical className="w-3 h-3 text-slate-500" />
                    <span>#</span>
                  </div>
                </th>
                <th className="py-1 px-3">Titolo / Artista</th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-300 transition" onClick={handleCycleBpmSort} title="Clicca per invertire o ripristinare sequenza">
                  <div className="flex items-center gap-1">
                    <span>BPM</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th className="py-1 px-2">Key</th>
                <th className="py-1 px-2">Genere</th>
                <th className="py-1 px-2">Durata</th>
                <th className="py-1 px-3 text-right">Carica sul Deck</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181c28]">
              {displayedTracks.map((track, idx) => {
                const isNowPlaying = activeDeckTrack?.id === track.id;
                const isPlayed = playedTrackIds.includes(track.id);
                const isHighlighted = highlightedTrackId === track.id;
                const isBeingDragged = draggedTrackId === track.id;
                const isDropTarget = dragOverTrackId === track.id;

                return (
                  <tr
                    key={track.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, track)}
                    onDragOver={(e) => handleDragOver(e, track)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, track)}
                    onDragEnd={handleDragEnd}
                    className={`transition-all group relative select-none ${
                      isBeingDragged
                        ? 'opacity-35 bg-slate-800/80 border-dashed border-cyan-500'
                        : isDropTarget && dropPosition === 'before'
                        ? 'border-t-2 border-cyan-400 bg-cyan-950/40 shadow-[0_-2px_8px_rgba(6,182,212,0.4)]'
                        : isDropTarget && dropPosition === 'after'
                        ? 'border-b-2 border-cyan-400 bg-cyan-950/40 shadow-[0_2px_8px_rgba(6,182,212,0.4)]'
                        : isHighlighted
                        ? 'bg-cyan-950/80 ring-1 ring-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : isNowPlaying
                        ? activeDeckId === 'deckB'
                          ? 'bg-orange-950/20'
                          : 'bg-cyan-950/20'
                        : 'hover:bg-[#181c29]'
                    }`}
                  >
                    {/* Order Index & Drag Grip Handle */}
                    <td className="py-1.5 px-1.5 text-center font-mono text-[10px] text-slate-500">
                      <div className="flex items-center justify-center gap-1 group/grip">
                          <div
                            className="cursor-grab active:cursor-grabbing p-0.5 text-slate-600 group-hover/grip:text-cyan-400 group-hover:text-cyan-300 transition hover:bg-slate-800 rounded"
                            title="Trascina per riordinare la scaletta OPPURE trascina direttamente sopra i Piatti (Deck 1 / Deck 2) per caricarlo al volo!"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                        <span className="w-4 text-right font-bold text-slate-400">{idx + 1}</span>
                        {/* Quick Step Reorder Buttons on Hover for Trackpad / Touch */}
                        <div className="hidden group-hover:flex flex-col ml-0.5 text-slate-500">
                          {idx > 0 && (
                            <button
                              onClick={(e) => handleMoveStep(e, track.id, 'up')}
                              className="hover:text-cyan-300 p-0 leading-none -my-0.5 cursor-pointer"
                              title="Sposta su"
                            >
                              <ChevronUp className="w-2.5 h-2.5" />
                            </button>
                          )}
                          {idx < displayedTracks.length - 1 && (
                            <button
                              onClick={(e) => handleMoveStep(e, track.id, 'down')}
                              className="hover:text-cyan-300 p-0 leading-none -my-0.5 cursor-pointer"
                              title="Sposta giù"
                            >
                              <ChevronDown className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Title & Artist */}
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: track.color }}
                        />
                        <div>
                          <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition flex items-center gap-1.5 flex-wrap">
                            <span>{track.title}</span>
                            {isNowPlaying && (
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold flex items-center gap-1 shrink-0 ${
                                  activeDeckId === 'deckB'
                                    ? 'bg-orange-950/90 text-orange-300 border border-orange-500/50'
                                    : 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/50'
                                }`}
                              >
                                <Disc3 className="w-2.5 h-2.5 animate-spin" />
                                <span>IN ONDA ({activeDeckId === 'deckB' ? 'DECK 2' : 'DECK 1'})</span>
                              </span>
                            )}
                            {!isNowPlaying && isPlayed && (
                              <span
                                className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-medium shrink-0"
                                title="Già suonato durante questo set"
                              >
                                SUONATO
                              </span>
                            )}
                            {track.isCustom && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40">
                                FILE INSERITO
                              </span>
                            )}
                            {track.idealMixPoints && (
                              <button
                                onClick={() => onOpenTrackAnalysis && onOpenTrackAnalysis(track)}
                                className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
                                title="Visualizza Analisi AI & Punti di Mixaggio"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>AI CUES</span>
                              </button>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {track.artist}
                          </div>
                        </div>
                      </div>
                    </td>

                  {/* BPM */}
                  <td className="py-1.5 px-2 font-mono font-bold text-slate-200">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700/60">
                      {track.bpm.toFixed(1)}
                    </span>
                  </td>

                  {/* Key (Camelot Color Coded) */}
                  <td className="py-1.5 px-2 font-mono">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 border border-slate-700 font-bold">
                      {track.key}
                    </span>
                  </td>

                  {/* Genre */}
                  <td className="py-1.5 px-2 text-slate-400">
                    {track.genre}
                  </td>

                  {/* Duration */}
                  <td className="py-1.5 px-2 font-mono text-slate-400">
                    {formatDuration(track.duration)}
                  </td>

                  {/* Quick Load Buttons */}
                  <td className="py-1.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onLoadTrack('deckA', track)}
                        className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-800 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono font-bold transition active:scale-95 cursor-pointer"
                        title="Carica brano su Deck A"
                      >
                        DECK A
                      </button>

                      <button
                        onClick={() => onLoadTrack('deckB', track)}
                        className="px-2.5 py-1 rounded bg-orange-950/80 hover:bg-orange-800 border border-orange-500/50 text-orange-300 text-[10px] font-mono font-bold transition active:scale-95 cursor-pointer"
                        title="Carica brano su Deck B"
                      >
                        DECK B
                      </button>

                      {isQuad && (
                        <>
                          <button
                            onClick={() => onLoadTrack('deckC', track)}
                            className="px-2 py-1 rounded bg-teal-950/80 hover:bg-teal-800 border border-teal-500/50 text-teal-300 text-[10px] font-mono font-bold transition active:scale-95 cursor-pointer"
                            title="Carica brano su Deck C"
                          >
                            C
                          </button>
                          <button
                            onClick={() => onLoadTrack('deckD', track)}
                            className="px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-800 border border-purple-500/50 text-purple-300 text-[10px] font-mono font-bold transition active:scale-95 cursor-pointer"
                            title="Carica brano su Deck D"
                          >
                            D
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
              {displayedTracks.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-slate-400">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <Search className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="font-bold text-slate-200 text-sm">
                        Nessun brano trovato
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Nessun brano corrisponde alla ricerca per{' '}
                        <span className="text-cyan-300 font-mono">
                          {searchQuery ? `«${searchQuery}»` : ''}
                          {minBpmInput || maxBpmInput
                            ? ` [${minBpmInput || '0'} - ${maxBpmInput || '∞'} BPM]`
                            : ''}
                        </span>
                        . Prova a modificare i termini di ricerca o ad allargare il range BPM.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setMinBpmInput('');
                          setMaxBpmInput('');
                          setSelectedCrate('all');
                          setActivePlaylistId(null);
                        }}
                        className="mt-1 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/60 text-cyan-300 text-xs font-semibold hover:bg-cyan-900 transition cursor-pointer"
                      >
                        Ripristina tutti i brani
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Scaletta Dialog Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111420] border border-cyan-500/40 rounded-xl max-w-md w-full p-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <BookmarkPlus className="w-4 h-4 text-cyan-400" />
                <span>Salva Scaletta DJ Personalizzata</span>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Nome della Scaletta / Setlist:
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Es. Opening Set 126-132 BPM, Closing Party..."
                  className="w-full px-3 py-1.5 bg-[#0a0d16] border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 font-sans"
                  autoFocus
                />
              </div>

              <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Numero di brani inclusi:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {displayedTracks.length} brani
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Ordinamento attuale:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {bpmSortState === 'asc'
                      ? 'BPM Crescente ↗'
                      : bpmSortState === 'desc'
                      ? 'BPM Decrescente ↘'
                      : 'Sequenza Manuale / Inserimento'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Range BPM del set:</span>
                  <span className="font-mono text-amber-300">
                    {displayedTracks.length > 0
                      ? `${Math.min(...displayedTracks.map((t) => t.bpm)).toFixed(1)} - ${Math.max(
                          ...displayedTracks.map((t) => t.bpm)
                        ).toFixed(1)} BPM`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 border border-slate-700 cursor-pointer"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveCurrentScaletta}
                disabled={!newPlaylistName.trim()}
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salva Scaletta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
