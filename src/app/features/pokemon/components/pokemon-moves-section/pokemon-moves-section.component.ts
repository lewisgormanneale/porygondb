import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

interface MoveTableRow {
  moveName: string;
  learnMethodKey: string;
  levelLearnedAt: number;
}

interface MoveMethodTab {
  key: string;
  label: string;
  moves: MoveTableRow[];
}

@Component({
  selector: 'pokemon-moves-section',
  imports: [MatTabsModule, MatCardModule, MatPaginatorModule],
  templateUrl: './pokemon-moves-section.component.html',
  styleUrl: './pokemon-moves-section.component.scss',
})
export class PokemonMovesSectionComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly versionGroupName = input.required<string>();
  readonly isNationalMode = input<boolean>(false);
  readonly pageSize = 10;
  readonly pageByMethodKey = signal<Record<string, number>>({});

  readonly movesTableRows = computed<MoveTableRow[]>(() => {
    const selectedPokemon = this.pokemonStore.selectedEntity();
    const versionGroupName = this.versionGroupName();

    if (!selectedPokemon || !versionGroupName) {
      return [];
    }

    return selectedPokemon.moves
      .flatMap((move) =>
        move.version_group_details
          .filter((detail) => detail.version_group.name === versionGroupName)
          .map((detail) => ({
            moveName: this.formatName(move.move.name),
            learnMethodKey: detail.move_learn_method.name,
            levelLearnedAt: detail.level_learned_at,
          }))
      )
      .sort((a, b) => {
        if (a.learnMethodKey !== b.learnMethodKey) {
          return a.learnMethodKey.localeCompare(b.learnMethodKey);
        }
        if (a.levelLearnedAt !== b.levelLearnedAt) {
          return a.levelLearnedAt - b.levelLearnedAt;
        }
        return a.moveName.localeCompare(b.moveName);
      });
  });

  readonly moveMethodTabs = computed<MoveMethodTab[]>(() => {
    const grouped = new Map<string, MoveTableRow[]>();
    this.movesTableRows().forEach((move) => {
      const existing = grouped.get(move.learnMethodKey) ?? [];
      existing.push(move);
      grouped.set(move.learnMethodKey, existing);
    });

    return [...grouped.entries()]
      .map(([key, moves]) => ({
        key,
        label: this.formatMethodLabel(key),
        moves: this.sortMovesForMethod(key, moves),
      }))
      .sort((a, b) => {
        const priorityDiff = this.getMethodPriority(a.key) - this.getMethodPriority(b.key);
        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return a.label.localeCompare(b.label);
      });
  });

  constructor() {
    effect(() => {
      const tabs = this.moveMethodTabs();
      const currentPages = untracked(() => this.pageByMethodKey());
      const nextPages: Record<string, number> = {};

      let hasChanges = Object.keys(currentPages).length !== tabs.length;

      tabs.forEach((tab) => {
        const maxPage = Math.max(Math.ceil(tab.moves.length / this.pageSize) - 1, 0);
        const currentPage = currentPages[tab.key] ?? 0;
        const clampedPage = Math.min(currentPage, maxPage);
        nextPages[tab.key] = clampedPage;

        if (clampedPage !== currentPage) {
          hasChanges = true;
        }
      });

      if (hasChanges) {
        this.pageByMethodKey.set(nextPages);
      }
    });
  }

  getPaginatedRows(methodKey: string, rows: MoveTableRow[]): MoveTableRow[] {
    const pageIndex = this.getPageIndex(methodKey);
    const start = pageIndex * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  }

  getPageIndex(methodKey: string): number {
    return this.pageByMethodKey()[methodKey] || 0;
  }

  onMethodPageChange(methodKey: string, event: PageEvent): void {
    this.pageByMethodKey.update((current) => ({
      ...current,
      [methodKey]: event.pageIndex,
    }));
  }

  private formatName(name: string): string {
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private formatMethodLabel(methodKey: string): string {
    if (methodKey === 'machine') {
      return 'TM/HMs';
    }

    if (methodKey === 'level-up') {
      return 'Level Up';
    }

    return this.formatName(methodKey);
  }

  private getMethodPriority(methodKey: string): number {
    if (methodKey === 'level-up') {
      return 0;
    }

    if (methodKey === 'machine') {
      return 1;
    }

    return 2;
  }

  private sortMovesForMethod(methodKey: string, moves: MoveTableRow[]): MoveTableRow[] {
    if (methodKey === 'level-up') {
      return [...moves].sort((a, b) => {
        if (a.levelLearnedAt !== b.levelLearnedAt) {
          return a.levelLearnedAt - b.levelLearnedAt;
        }

        return a.moveName.localeCompare(b.moveName);
      });
    }

    return [...moves].sort((a, b) => a.moveName.localeCompare(b.moveName));
  }
}
