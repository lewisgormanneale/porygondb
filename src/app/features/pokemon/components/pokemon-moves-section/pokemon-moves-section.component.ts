import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { TypeChipComponent } from '../../../../shared/components/type-chip/type-chip.component';

interface MoveTableRow {
  moveKey: string;
  moveName: string;
  learnMethodKey: string;
  levelLearnedAt: number;
}

interface MoveTableMoveDetails {
  typeKey: string;
  typeName: string;
  damageClassKey: string;
  damageClassName: string;
  pp: number | null;
  power: number | null;
  accuracy: number | null;
}

interface MoveMethodTab {
  key: string;
  label: string;
  moves: MoveTableRow[];
}

@Component({
  selector: 'pokemon-moves-section',
  imports: [MatTabsModule, MatCardModule, MatPaginatorModule, MatIconModule, TypeChipComponent],
  templateUrl: './pokemon-moves-section.component.html',
  styleUrl: './pokemon-moves-section.component.scss',
})
export class PokemonMovesSectionComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly pokemonService = inject(PokemonService);
  readonly destroyRef = inject(DestroyRef);
  readonly versionGroupName = input.required<string>();
  readonly isNationalMode = input<boolean>(false);
  readonly pageSize = 10;
  readonly pageByMethodKey = signal<Record<string, number>>({});
  readonly activeTabIndex = signal(0);
  readonly moveDetailsByKey = signal<Record<string, MoveTableMoveDetails>>({});

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
            moveKey: move.move.name,
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

    toObservable(this.currentlyVisibleMoves)
      .pipe(
        switchMap((rows) => {
          const cachedMoveDetails = this.moveDetailsByKey();
          const missingMoveKeys = [...new Set(rows.map((row) => row.moveKey))].filter(
            (moveKey) => !cachedMoveDetails[moveKey]
          );

          if (!missingMoveKeys.length) {
            return of<Record<string, MoveTableMoveDetails>>({});
          }

          return forkJoin(
            missingMoveKeys.map((moveKey) =>
              this.pokemonService.getMoveByName(moveKey).pipe(
                map((move): [string, MoveTableMoveDetails] => [
                  moveKey,
                  {
                    typeKey: move.type.name,
                    typeName: this.formatName(move.type.name),
                    damageClassKey: move.damage_class.name,
                    damageClassName: this.formatName(move.damage_class.name),
                    pp: move.pp,
                    power: move.power,
                    accuracy: move.accuracy,
                  },
                ]),
                catchError(() => of<[string, MoveTableMoveDetails] | null>(null))
              )
            )
          ).pipe(
            map((entries) =>
              entries.reduce<Record<string, MoveTableMoveDetails>>((accumulator, entry) => {
                if (!entry) {
                  return accumulator;
                }

                const [moveKey, details] = entry;
                accumulator[moveKey] = details;
                return accumulator;
              }, {})
            )
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((detailsMap) => {
        if (!Object.keys(detailsMap).length) {
          return;
        }

        this.moveDetailsByKey.update((current) => ({
          ...current,
          ...detailsMap,
        }));
      });
  }

  readonly currentMethodTab = computed<MoveMethodTab | null>(() => {
    const tabs = this.moveMethodTabs();
    if (!tabs.length) {
      return null;
    }

    const activeTab = tabs[this.activeTabIndex()];
    return activeTab ?? tabs[0];
  });

  readonly currentlyVisibleMoves = computed<MoveTableRow[]>(() => {
    const activeTab = this.currentMethodTab();
    if (!activeTab) {
      return [];
    }

    return this.getPaginatedRows(activeTab.key, activeTab.moves);
  });

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

  onTabChange(tabIndex: number): void {
    this.activeTabIndex.set(tabIndex);
  }

  getMoveDetails(moveKey: string): MoveTableMoveDetails | null {
    return this.moveDetailsByKey()[moveKey] ?? null;
  }

  formatStatValue(value: number | null | undefined): string {
    return value === null || value === undefined ? '-' : `${value}`;
  }

  getMoveCategoryIcon(damageClassKey: string): string {
    if (damageClassKey === 'physical') {
      return 'swords';
    }

    if (damageClassKey === 'special') {
      return 'auto_awesome';
    }

    if (damageClassKey === 'status') {
      return 'tune';
    }

    return 'help_outline';
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
