/**
 * @chunk 7.17 - QA Page Shell
 * Zustand store for Visual QA state management
 */
import { create } from 'zustand';
import { CapturedAsset, Issue } from '../types/qa';

interface QAState {
  mode: 'single' | 'compare';
  setMode: (mode: 'single' | 'compare') => void;

  // Single mode
  asset: CapturedAsset | null;
  setAsset: (asset: CapturedAsset | null) => void;

  issues: Issue[];
  setIssues: (issues: Issue[]) => void;

  activeIssueId: string | null;
  setActiveIssue: (id: string | null) => void;

  // Handler registration for cross-component sync
  panToIssueHandler: ((issueId: string) => void) | null;
  setPanToIssueHandler: (handler: ((issueId: string) => void) | null) => void;

  scrollToIssueHandler: ((issueId: string) => void) | null;
  setScrollToIssueHandler: (handler: ((issueId: string) => void) | null) => void;

  // Compare mode
  sourceAsset: CapturedAsset | null;
  targetAsset: CapturedAsset | null;
  setSourceAsset: (asset: CapturedAsset | null) => void;
  setTargetAsset: (asset: CapturedAsset | null) => void;

  // Analysis state
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export const useQAStore = create<QAState>((set) => ({
  mode: 'single',
  setMode: (mode) => set({ mode }),

  asset: null,
  setAsset: (asset) => set({ asset }),

  issues: [],
  setIssues: (issues) => set({ issues }),

  activeIssueId: null,
  setActiveIssue: (id) => set({ activeIssueId: id }),

  panToIssueHandler: null,
  setPanToIssueHandler: (handler) => set({ panToIssueHandler: handler }),

  scrollToIssueHandler: null,
  setScrollToIssueHandler: (handler) => set({ scrollToIssueHandler: handler }),

  sourceAsset: null,
  targetAsset: null,
  setSourceAsset: (asset) => set({ sourceAsset: asset }),
  setTargetAsset: (asset) => set({ targetAsset: asset }),

  isAnalyzing: false,
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
}));
