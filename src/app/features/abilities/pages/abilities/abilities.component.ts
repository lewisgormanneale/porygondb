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

const GENERATION_DETAIL_CONCURRENCY = 8;
const ABILITY_DETAIL_FETCH_CONCURRENCY = 8;
// Abilities weren't introduced as a game mechanic until Generation III, so
// Generations I and II never have any and are excluded from the filter.
const EARLIEST_ABILITY_GENERATION_ID = 3;

export const ALL_FILTER_VALUE = 'all';

interface GenerationOption {
  id: number;
  name: string;
  displayName: string;
}

interface AbilityDetailSummary {
  displayName: string | null;
  description: string | null;
}

interface AbilityListItem {
  name: string;
  displayName: string;
  generationName: string;
  generationDisplayName: string;
}

@Component({
  selector: 'app-abilities',
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
  ],
  templateUrl: './abilities.component.html',
  styleUrl: './abilities.component.scss',
})
export class AbilitiesComponent {
  private readonly pokemonService = inject(PokemonService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly ALL_FILTER_VALUE = ALL_FILTER_VALUE;
  readonly displayedColumns = ['name', 'generation', 'description'];

  readonly isLoading = signal(true);
  readonly searchValue = signal('');
  readonly selectedGeneration = signal(ALL_FILTER_VALUE);
  readonly abilities = signal<AbilityListItem[]>([]);
  readonly generationOptions = signal<GenerationOption[]>([]);
  readonly abilityDetailByName = signal<Record<string, AbilityDetailSummary>>({});
  readonly filtersExpanded = signal(true);
  readonly pageEvent = signal<PageEvent>({
    pageIndex: 0,
    pageSize: 50,
    length: 0,
  });

  readonly activeFilterCount = computed(() => {
    return this.selectedGeneration() !== ALL_FILTER_VALUE ? 1 : 0;
  });

  readonly filteredAbilities = computed(() => {
    const query = this.searchValue().trim().toLowerCase();
    const generation = this.selectedGeneration();
    const entries = this.abilities();

    return entries.filter((entry) => {
      if (
        query &&
        !entry.name.includes(query) &&
        !entry.displayName.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (generation !== ALL_FILTER_VALUE && entry.generationName !== generation) {
        return false;
      }
      return true;
    });
  });

  readonly paginatedAbilities = computed(() => {
    const entries = this.filteredAbilities();
    const page = this.pageEvent();
    const start = page.pageIndex * page.pageSize;
    return entries.slice(start, start + page.pageSize);
  });

  constructor() {
    // Filters default open on larger screens and collapsed on handsets, where
    // the select otherwise pushes the table below the fold.
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.filtersExpanded.set(!state.matches);
      });

    forkJoin({
      abilities: this.pokemonService.listAbilities(0, 10000),
      generations: this.pokemonService.listGenerations(0, 100),
    })
      .pipe(
        switchMap(({ abilities, generations }) =>
          forkJoin({
            abilities: of(abilities),
            generationDetails: from(generations.results).pipe(
              mergeMap(
                (generation) => this.pokemonService.getGenerationByUrl(generation.url),
                GENERATION_DETAIL_CONCURRENCY
              ),
              toArray()
            ),
          })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ abilities, generationDetails }) => {
        const generationByAbilityName = new Map<string, GenerationOption>();
        const generationOptions: GenerationOption[] = [];

        for (const generation of generationDetails) {
          if (generation.id < EARLIEST_ABILITY_GENERATION_ID) {
            continue;
          }

          const generationOption: GenerationOption = {
            id: generation.id,
            name: generation.name,
            displayName: this.formatGenerationLabel(generation.name),
          };
          generationOptions.push(generationOption);

          for (const ability of generation.abilities) {
            generationByAbilityName.set(ability.name, generationOption);
          }
        }

        const mapped: AbilityListItem[] = abilities.results
          .map((entry) => {
            const generation = generationByAbilityName.get(entry.name);

            return {
              name: entry.name,
              displayName: this.formatName(entry.name),
              generationName: generation?.name ?? '',
              generationDisplayName: generation?.displayName ?? 'Unknown',
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        this.abilities.set(mapped);
        this.generationOptions.set(generationOptions.sort((a, b) => a.id - b.id));
        this.pageEvent.set({
          ...this.pageEvent(),
          length: mapped.length,
        });
        this.isLoading.set(false);
      });

    // Only the currently visible page's ability details are fetched (proper
    // English name and in-game description), rather than fetching every
    // ability's full detail up front.
    effect(() => {
      this.ensureAbilityDetailsLoaded(this.paginatedAbilities());
    });
  }

  toggleFilters(): void {
    this.filtersExpanded.update((expanded) => !expanded);
  }

  onSearchInput(query: string): void {
    this.searchValue.set(query);
    this.resetToFirstPage();
  }

  onGenerationChange(generation: string): void {
    this.selectedGeneration.set(generation);
    this.resetToFirstPage();
  }

  onPageChange(event: PageEvent): void {
    this.pageEvent.set({
      ...event,
      length: this.filteredAbilities().length,
    });
  }

  getAbilityDetails(abilityName: string): AbilityDetailSummary | null {
    return this.abilityDetailByName()[abilityName] ?? null;
  }

  private ensureAbilityDetailsLoaded(pageAbilities: AbilityListItem[]): void {
    const cache = this.abilityDetailByName();
    const pending = pageAbilities.filter((ability) => !(ability.name in cache));
    if (pending.length === 0) {
      return;
    }

    from(pending)
      .pipe(
        mergeMap(
          (ability) =>
            this.pokemonService.getAbilityByName(ability.name).pipe(
              map((detail) => ({
                name: ability.name,
                displayName:
                  detail.names.find((entry) => entry.language.name === 'en')?.name ?? null,
                description:
                  detail.flavor_text_entries.find((entry) => entry.language.name === 'en')
                    ?.flavor_text ?? null,
              })),
              catchError(() => of({ name: ability.name, displayName: null, description: null }))
            ),
          ABILITY_DETAIL_FETCH_CONCURRENCY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ name, displayName, description }) => {
        this.abilityDetailByName.update((current) => ({
          ...current,
          [name]: { displayName, description: description?.replace(/[\n\f\r]/g, ' ') ?? null },
        }));
      });
  }

  private resetToFirstPage(): void {
    this.pageEvent.set({
      ...this.pageEvent(),
      pageIndex: 0,
      length: this.filteredAbilities().length,
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
