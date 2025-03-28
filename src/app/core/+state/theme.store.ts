import { computed } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import { Theme } from "../enums/theme.enum";

interface ThemeState {
  theme: Theme;
}

export const ThemeStore = signalStore(
  { providedIn: "root" },
  withState<ThemeState>({ theme: Theme.LIGHT }),
  withComputed(({ theme }) => ({
    getCurrentTheme: computed(() => theme()),
    isDarkTheme: computed(
      () => theme() === Theme.DARK || theme() === Theme.DARK_CONTRAST
    ),
    isLightTheme: computed(
      () => theme() === Theme.LIGHT || theme() === Theme.LIGHT_CONTRAST
    ),
  })),
  withMethods((store) => ({
    toggleTheme() {
      const newTheme = store.isDarkTheme() ? Theme.LIGHT : Theme.DARK;
      patchState(store, { theme: newTheme });
      document.body.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    },
  })),
  withHooks({
    onInit(store) {
      const storedTheme = localStorage.getItem("theme") as Theme | null;
      if (storedTheme) {
        patchState(store, { theme: storedTheme });
        document.body.setAttribute("data-theme", storedTheme);
      } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          patchState(store, { theme: Theme.DARK });
          document.body.setAttribute("data-theme", Theme.DARK);
        } else {
          patchState(store, { theme: Theme.LIGHT });
          document.body.setAttribute("data-theme", Theme.LIGHT);
        }
      }
    },
  })
);

export type ThemeStore = InstanceType<typeof ThemeStore>;
