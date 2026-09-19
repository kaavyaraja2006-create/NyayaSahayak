import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConflictSensitivity, Density, ThemeChoice } from '../types';

export type ToastKind = 'success' | 'info' | 'warning' | 'error';
export interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface PersistedUi {
  theme: ThemeChoice;
  autoNight: boolean;
  nightFrom: string;
  nightTo: string;
  density: Density;
  reduceMotion: boolean;
  sidebarCollapsed: boolean;
  conflictSensitivity: ConflictSensitivity;
  authorityTopK: number;
  redactionEnabled: boolean;
  pdfPageSize: 'A4' | 'Letter';
  jsonPretty: boolean;
}

interface EphemeralUi {
  focusMode: boolean;
  paletteOpen: boolean;
  analysisOpen: boolean;
  mobileNavOpen: boolean;
  toasts: ToastItem[];
}

interface UiActions {
  set: (patch: Partial<PersistedUi>) => void;
  setFocusMode: (on: boolean) => void;
  setPaletteOpen: (on: boolean) => void;
  setAnalysisOpen: (on: boolean) => void;
  setMobileNavOpen: (on: boolean) => void;
  pushToast: (message: string, kind?: ToastKind) => void;
  dismissToast: (id: number) => void;
}

export type UiState = PersistedUi & EphemeralUi & UiActions;

const DEFAULTS: PersistedUi = {
  theme: 'dark',
  autoNight: true,
  nightFrom: '22:00',
  nightTo: '06:00',
  density: 'comfortable',
  reduceMotion: false,
  sidebarCollapsed: false,
  conflictSensitivity: 'balanced',
  authorityTopK: 5,
  redactionEnabled: true,
  pdfPageSize: 'A4',
  jsonPretty: true,
};

let toastId = 0;

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      focusMode: false,
      paletteOpen: false,
      analysisOpen: false,
      mobileNavOpen: false,
      toasts: [],
      set: (patch) => set(patch),
      setFocusMode: (on) => set({ focusMode: on }),
      setPaletteOpen: (on) => set({ paletteOpen: on }),
      setAnalysisOpen: (on) => set({ analysisOpen: on }),
      setMobileNavOpen: (on) => set({ mobileNavOpen: on }),
      pushToast: (message, kind = 'success') => {
        toastId += 1;
        const id = toastId;
        set({ toasts: [...get().toasts.slice(-3), { id, message, kind }] });
        setTimeout(() => get().dismissToast(id), 3800);
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
    }),
    {
      name: 'nyaya-ui',
      version: 1,
      partialize: (s): PersistedUi => ({
        theme: s.theme,
        autoNight: s.autoNight,
        nightFrom: s.nightFrom,
        nightTo: s.nightTo,
        density: s.density,
        reduceMotion: s.reduceMotion,
        sidebarCollapsed: s.sidebarCollapsed,
        conflictSensitivity: s.conflictSensitivity,
        authorityTopK: s.authorityTopK,
        redactionEnabled: s.redactionEnabled,
        pdfPageSize: s.pdfPageSize,
        jsonPretty: s.jsonPretty,
      }),
    },
  ),
);

/** Fire-and-forget toast helper usable outside React components. */
export const toast = (message: string, kind: ToastKind = 'success'): void => {
  useUiStore.getState().pushToast(message, kind);
};
