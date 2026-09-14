import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { forkJoin, from, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, toArray } from 'rxjs/operators';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { TypeChipComponent } from '../../../../shared/components/type-chip/type-chip.component';

const FILTER_DETAIL_CONCURRENCY = 8;
const MOVE_DETAIL_FETCH_CONCURRENCY = 8;

export const ALL_FILTER_VALUE = 'all';

interface FilterOption {
  name: string;
  displayName: string;
}

interface GenerationOption {
  id: number;
  name: string;
  displayName: string;
}

interface MoveDetailSummary {
  power: number | null;
  accuracy: number | null;
  pp: number | null;
}

interface MoveListItem {
  name: string;
  displayName: string;
  typeName: string;
  typeDisplayName: string;
  damageClassName: string;
  damageClassDisplayName: string;
  generationName: string;
  generationDisplayName: string;
}

@Component({
  selector: 'app-moves',
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    RouterModule,
    TypeChipComponent,
  ],
  templateUrl: './moves.component.html',
  styleUrl: './moves.component.scss',
})
export class MovesComponent {
  private readonly pokemonService = inject(PokemonService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly ALL_FILTER_VALUE = ALL_FILTER_VALUE;
  readonly displayedColumns = ['name', 'type', 'category', 'power', 'accuracy', 'pp'];

  readonly isLoading = signal(true);
  readonly searchValue = signal('');
  readonly selectedType = signal(ALL_FILTER_VALUE);
  readonly selectedDamageClass = signal(ALL_FILTER_VALUE);
  readonly selectedGeneration = signal(ALL_FILTER_VALUE);
  readonly moves = signal<MoveListItem[]>([]);
  readonly typeOptions = signal<FilterOption[]>([]);
  readonly damageClassOptions = signal<FilterOption[]>([]);
  readonly generationOptions = signal<GenerationOption[]>([]);
  readonly moveDetailByName = signal<Record<string, MoveDetailSummary>>({});
  readonly filtersExpanded = signal(true);
  readonly pageEvent = signal<PageEvent>({
    pageIndex: 0,
    pageSize: 50,
    length: 0,
  });

  readonly activeFilterCount = computed(() => {
    return [this.selectedType(), this.selectedDamageClass(), this.selectedGeneration()].filter(
      (value) => value !== ALL_FILTER_VALUE
    ).length;
  });

  readonly filteredMoves = computed(() => {
    const query = this.searchValue().trim().toLowerCase();
    const type = this.selectedType();
    const damageClass = this.selectedDamageClass();
    const generation = this.selectedGeneration();

    return this.moves().filter((move) => {
      if (query && !move.name.includes(query) && !move.displayName.toLowerCase().includes(query)) {
        return false;
      }
      if (type !== ALL_FILTER_VALUE && move.typeName !== type) {
        return false;
      }
      if (damageClass !== ALL_FILTER_VALUE && move.damageClassName !== damageClass) {
        return false;
      }
      if (generation !== ALL_FILTER_VALUE && move.generationName !== generation) {
        return false;
      }
      return true;
    });
  });

  readonly paginatedMoves = computed(() => {
    const entries = this.filteredMoves();
    const page = this.pageEvent();
    const start = page.pageIndex * page.pageSize;
    return entries.slice(start, start + page.pageSize);
  });

  constructor() {
    // Filters default open on larger screens and collapsed on handsets, where
    // two selects otherwise push the table below the fold.
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.filtersExpanded.set(!state.matches);
      });

    forkJoin({
      moves: this.pokemonService.listMoves(0, 10000),
      types: this.pokemonService.listTypes(0, 1000),
      damageClasses: this.pokemonService.listMoveDamageClasses(0, 1000),
      generations: this.pokemonService.listGenerations(0, 100),
    })
      .pipe(
        switchMap(({ moves, types, damageClasses, generations }) =>
          forkJoin({
            moves: of(moves),
            typeDetails: from(types.results).pipe(
              mergeMap(
                (type) => this.pokemonService.getTypeByUrl(type.url),
                FILTER_DETAIL_CONCURRENCY
              ),
              toArray()
            ),
            damageClassDetails: from(damageClasses.results).pipe(
              mergeMap(
                (damageClass) => this.pokemonService.getMoveDamageClassByUrl(damageClass.url),
                FILTER_DETAIL_CONCURRENCY
              ),
              toArray()
            ),
            generationDetails: from(generations.results).pipe(
              mergeMap(
                (generation) => this.pokemonService.getGenerationByUrl(generation.url),
                FILTER_DETAIL_CONCURRENCY
              ),
              toArray()
            ),
          })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ moves, typeDetails, damageClassDetails, generationDetails }) => {
        const typeByMoveName = new Map<string, FilterOption>();
        const typeOptions: FilterOption[] = [];

        for (const type of typeDetails) {
          const typeOption: FilterOption = {
            name: type.name,
            displayName: this.formatName(type.name),
          };
          typeOptions.push(typeOption);

          for (const move of type.moves) {
            typeByMoveName.set(move.name, typeOption);
          }
        }

        const damageClassByMoveName = new Map<string, FilterOption>();
        const damageClassOptions: FilterOption[] = [];

        for (const damageClass of damageClassDetails) {
          const damageClassOption: FilterOption = {
            name: damageClass.name,
            displayName: this.formatName(damageClass.name),
          };
          damageClassOptions.push(damageClassOption);

          for (const move of damageClass.moves) {
            damageClassByMoveName.set(move.name, damageClassOption);
          }
        }

        const generationByMoveName = new Map<string, GenerationOption>();
        const generationOptions: GenerationOption[] = [];

        for (const generation of generationDetails) {
          const generationOption: GenerationOption = {
            id: generation.id,
            name: generation.name,
            displayName: this.formatGenerationLabel(generation.name),
          };
          generationOptions.push(generationOption);

          for (const move of generation.moves) {
            generationByMoveName.set(move.name, generationOption);
          }
        }

        const mapped: MoveListItem[] = moves.results
          .map((entry) => {
            const type = typeByMoveName.get(entry.name);
            const damageClass = damageClassByMoveName.get(entry.name);
            const generation = generationByMoveName.get(entry.name);

            return {
              name: entry.name,
              displayName: this.formatName(entry.name),
              typeName: type?.name ?? '',
              typeDisplayName: type?.displayName ?? 'Unknown',
              damageClassName: damageClass?.name ?? '',
              damageClassDisplayName: damageClass?.displayName ?? 'Unknown',
              generationName: generation?.name ?? '',
              generationDisplayName: generation?.displayName ?? 'Unknown',
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        this.moves.set(mapped);
        this.typeOptions.set(
          typeOptions.sort((a, b) => a.displayName.localeCompare(b.displayName))
        );
        this.damageClassOptions.set(
          damageClassOptions.sort((a, b) => a.displayName.localeCompare(b.displayName))
        );
        this.generationOptions.set(generationOptions.sort((a, b) => a.id - b.id));
        this.pageEvent.set({
          ...this.pageEvent(),
          length: mapped.length,
        });
        this.isLoading.set(false);
      });

    // Only the currently visible page's move details are fetched (power,
    // accuracy, PP), rather than fetching every move's full detail up front.
    effect(() => {
      this.ensureMoveDetailsLoaded(this.paginatedMoves());
    });
  }

  toggleFilters(): void {
    this.filtersExpanded.update((expanded) => !expanded);
  }

  onSearchInput(query: string): void {
    this.searchValue.set(query);
    this.resetToFirstPage();
  }

  onTypeChange(type: string): void {
    this.selectedType.set(type);
    this.resetToFirstPage();
  }

  onDamageClassChange(damageClass: string): void {
    this.selectedDamageClass.set(damageClass);
    this.resetToFirstPage();
  }

  onGenerationChange(generation: string): void {
    this.selectedGeneration.set(generation);
    this.resetToFirstPage();
  }

  onPageChange(event: PageEvent): void {
    this.pageEvent.set({
      ...event,
      length: this.filteredMoves().length,
    });
  }

  getMoveDetails(moveName: string): MoveDetailSummary | null {
    return this.moveDetailByName()[moveName] ?? null;
  }

  formatStatValue(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : `${value}`;
  }

  private ensureMoveDetailsLoaded(pageMoves: MoveListItem[]): void {
    const cache = this.moveDetailByName();
    const pending = pageMoves.filter((move) => !(move.name in cache));
    if (pending.length === 0) {
      return;
    }

    from(pending)
      .pipe(
        mergeMap(
          (move) =>
            this.pokemonService.getMoveByName(move.name).pipe(
              map((detail) => ({
                name: move.name,
                power: detail.power,
                accuracy: detail.accuracy,
                pp: detail.pp,
              })),
              catchError(() => of({ name: move.name, power: null, accuracy: null, pp: null }))
            ),
          MOVE_DETAIL_FETCH_CONCURRENCY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ name, power, accuracy, pp }) => {
        this.moveDetailByName.update((current) => ({
          ...current,
          [name]: { power, accuracy, pp },
        }));
      });
  }

  private resetToFirstPage(): void {
    this.pageEvent.set({
      ...this.pageEvent(),
      pageIndex: 0,
      length: this.filteredMoves().length,
    });
  }

  private formatName(name: string): string {
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private formatGenerationLabel(name: string): string {
    const romanNumeral = name.split('-')[1]?.toUpperCase();
    return romanNumeral ? `Generation ${romanNumeral}` : this.formatName(name);
  }
}
