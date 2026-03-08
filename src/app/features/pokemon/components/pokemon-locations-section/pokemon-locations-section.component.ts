import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin, map, of, switchMap, catchError, finalize, combineLatest } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { GameService } from '../../../../shared/services/game.service';

interface EncounterDetailApi {
  min_level: number;
  max_level: number;
  chance: number;
  method: {
    name: string;
  };
}

interface EncounterVersionDetailApi {
  version: {
    name: string;
  };
  encounter_details: EncounterDetailApi[];
}

interface PokemonLocationEncounterApi {
  location_area: {
    name: string;
  };
  version_details: EncounterVersionDetailApi[];
}

interface VersionGroupApi {
  versions: {
    name: string;
  }[];
}

interface LocationRow {
  locationName: string;
  methods: string;
  levelRange: string;
  maxChance: number;
}

@Component({
  selector: 'pokemon-locations-section',
  imports: [MatCardModule, MatProgressBarModule],
  templateUrl: './pokemon-locations-section.component.html',
  styleUrl: './pokemon-locations-section.component.scss',
})
export class PokemonLocationsSectionComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly pokemonService = inject(PokemonService);
  readonly gameService = inject(GameService);
  readonly destroyRef = inject(DestroyRef);
  readonly versionGroupName = input.required<string>();
  readonly encounterUrl = computed(
    () => this.pokemonStore.selectedEntity()?.location_area_encounters ?? ''
  );
  readonly encounterUrl$ = toObservable(this.encounterUrl);
  readonly versionGroupName$ = toObservable(this.versionGroupName);

  readonly isLoading = signal(false);
  readonly locationRows = signal<LocationRow[]>([]);

  constructor() {
    combineLatest([this.encounterUrl$, this.versionGroupName$])
      .pipe(
        switchMap(([encounterUrl, versionGroupName]) => {
          this.locationRows.set([]);

          if (!encounterUrl || !versionGroupName) {
            this.isLoading.set(false);
            return of<LocationRow[]>([]);
          }

          this.isLoading.set(true);

          return forkJoin({
            encounters: this.pokemonService.getPokemonEncountersByUrl(encounterUrl),
            versionGroup: this.gameService.getVersionGroupByName(versionGroupName),
          }).pipe(
            map(({ encounters, versionGroup }) => this.toLocationRows(encounters, versionGroup)),
            catchError(() => of<LocationRow[]>([])),
            finalize(() => this.isLoading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((rows) => {
        this.locationRows.set(rows);
      });
  }

  private toLocationRows(encounters: unknown[], versionGroup: unknown): LocationRow[] {
    if (!this.isVersionGroupApi(versionGroup)) {
      return [];
    }

    const selectedVersionNames = new Set<string>(
      versionGroup.versions.map((version) => version.name)
    );

    const typedEncounters = encounters.filter(
      (encounter): encounter is PokemonLocationEncounterApi =>
        this.isPokemonLocationEncounterApi(encounter)
    );

    return typedEncounters
      .map((encounter) => this.toLocationRow(encounter, selectedVersionNames))
      .filter((row): row is LocationRow => row !== null)
      .sort((a, b) => a.locationName.localeCompare(b.locationName));
  }

  private toLocationRow(
    encounter: PokemonLocationEncounterApi,
    selectedVersionNames: Set<string>
  ): LocationRow | null {
    const relevantDetails: EncounterDetailApi[] = encounter.version_details
      .filter((detail) => selectedVersionNames.has(detail.version.name))
      .flatMap((detail) => detail.encounter_details);

    if (!relevantDetails.length) {
      return null;
    }

    const methodNames: string[] = [
      ...new Set(relevantDetails.map((detail) => this.formatName(detail.method.name))),
    ].sort((a, b) => a.localeCompare(b));

    const { minLevel, maxLevel } = this.getLevelRange(relevantDetails);
    const maxChance = Math.max(...relevantDetails.map((detail) => detail.chance));

    return {
      locationName: this.formatName(encounter.location_area.name),
      methods: methodNames.join(', '),
      levelRange: this.formatLevelRange(minLevel, maxLevel),
      maxChance,
    };
  }

  private getLevelRange(details: EncounterDetailApi[]): { minLevel: number; maxLevel: number } {
    const levels: number[] = details.flatMap((detail) => [detail.min_level, detail.max_level]);
    return {
      minLevel: Math.min(...levels),
      maxLevel: Math.max(...levels),
    };
  }

  private isVersionGroupApi(value: unknown): value is VersionGroupApi {
    if (!value || typeof value !== 'object') {
      return false;
    }

    return 'versions' in value && Array.isArray(value.versions);
  }

  private isPokemonLocationEncounterApi(value: unknown): value is PokemonLocationEncounterApi {
    if (!value || typeof value !== 'object') {
      return false;
    }

    return (
      'location_area' in value && 'version_details' in value && Array.isArray(value.version_details)
    );
  }

  private formatLevelRange(minLevel: number, maxLevel: number): string {
    if (minLevel === 0 && maxLevel === 0) {
      return '-';
    }

    if (minLevel === maxLevel) {
      return `${minLevel}`;
    }

    return `${minLevel}-${maxLevel}`;
  }

  private formatName(name: string): string {
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
