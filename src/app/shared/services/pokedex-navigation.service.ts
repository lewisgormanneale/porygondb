import { Injectable, signal } from '@angular/core';
import { PokemonEntry } from '../interfaces/pokeapi';

export interface PokedexNavigationContext {
  versionGroupName: string;
  entries: PokemonEntry[];
}

const STORAGE_KEY = 'pokedex-navigation-context';

@Injectable({
  providedIn: 'root',
})
export class PokedexNavigationService {
  private readonly _context = signal<PokedexNavigationContext | null>(this.loadFromStorage());

  readonly context = this._context.asReadonly();

  setContext(versionGroupName: string, entries: PokemonEntry[]): void {
    const ctx = { versionGroupName, entries };
    this._context.set(ctx);
    this.saveToStorage(ctx);
  }

  clearContext(): void {
    this._context.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  getAdjacentPokemon(currentName: string): {
    prev: PokemonEntry | null;
    next: PokemonEntry | null;
    currentIndex: number;
    total: number;
  } {
    const ctx = this._context();
    if (!ctx || ctx.entries.length === 0) {
      return { prev: null, next: null, currentIndex: -1, total: 0 };
    }

    const currentIndex = ctx.entries.findIndex(
      (entry) => entry.pokemon_species.name === currentName
    );

    if (currentIndex === -1) {
      return { prev: null, next: null, currentIndex: -1, total: ctx.entries.length };
    }

    const prev = currentIndex > 0 ? ctx.entries[currentIndex - 1] : null;
    const next = currentIndex < ctx.entries.length - 1 ? ctx.entries[currentIndex + 1] : null;

    return { prev, next, currentIndex, total: ctx.entries.length };
  }

  private loadFromStorage(): PokedexNavigationContext | null {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(ctx: PokedexNavigationContext): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
    } catch {
      // Storage full or unavailable - silently fail
    }
  }
}
