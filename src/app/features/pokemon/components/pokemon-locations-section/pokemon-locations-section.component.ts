import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

  readonly isLoading = signal(false);
  readonly locationRows = signal<LocationRow[]>([]);

  constructor() {
    effect(() => {
      const encounterUrl = this.pokemonStore.selectedEntity()?.location_area_encounters;
      const versionGroupName = this.versionGroupName();

      this.locationRows.set([]);

      if (!encounterUrl || !versionGroupName) {
        return;
      }

      this.isLoading.set(true);

      forkJoin({
        encounters: this.pokemonService.getPokemonEncountersByUrl(encounterUrl),
        versionGroup: this.gameService.getVersionGroupByName(versionGroupName),
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: ({ encounters, versionGroup }) => {
            const typedEncounters: PokemonLocationEncounterApi[] = Array.isArray(encounters)
              ? (encounters as PokemonLocationEncounterApi[])
              : [];
            const typedVersionGroup = versionGroup as VersionGroupApi;
            const selectedVersionNames = new Set<string>(
              typedVersionGroup.versions.map((version) => version.name)
            );

            const rows: LocationRow[] = typedEncounters
              .map((encounter) => this.toLocationRow(encounter, selectedVersionNames))
              .filter((row): row is LocationRow => row !== null)
              .sort((a, b) => a.locationName.localeCompare(b.locationName));

            this.locationRows.set(rows);
          },
          error: () => {
            this.locationRows.set([]);
          },
          complete: () => {
            this.isLoading.set(false);
          },
        });
    });
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
