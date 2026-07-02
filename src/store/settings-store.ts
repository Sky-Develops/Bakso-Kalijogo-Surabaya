import { create } from "zustand";
import { StoreSettings } from "@/types";
import { fetchStoreSettings } from "@/lib/settings-api";

interface SettingsState {
  settings: StoreSettings | null;
  isLoading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  setSettings: (settings: StoreSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: true,
  error: null,
  loadSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchStoreSettings();
      set({ settings: data, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load settings",
        isLoading: false
      });
    }
  },
  setSettings: (settings) => set({ settings }),
}));
