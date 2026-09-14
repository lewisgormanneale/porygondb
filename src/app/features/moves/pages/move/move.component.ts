import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { catchError, of, take } from 'rxjs';
import { Move, MoveStatChange } from '../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { TypeChipComponent } from '../../../../shared/components/type-chip/type-chip.component';

interface MoveMetaRow {
  label: string;
  value: string;
}

interface StatChangeLabel {
  label: string;
  isPositive: boolean;
}

@Component({
  selector: 'app-move',
  imports: [
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    RouterModule,
    TypeChipComponent,
  ],
  templateUrl: './move.component.html',
  styleUrl: './move.component.scss',
})
export class MoveComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pokemonService = inject(PokemonService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly move = signal<Move | null>(null);
  readonly speciesNameByPokemonName = signal<Record<string, string>>({});

  readonly displayName = computed(() => {
    const move = this.move();
    if (!move) {
      return '';
    }

    const englishName = move.names.find((entry) => entry.language.name === 'en')?.name;
    return englishName || this.formatName(move.name);
  });

  readonly generationLabel = computed(() => {
    const move = this.move();
    if (!move) {
      return '';
    }

    const romanNumeral = move.generation.name.split('-')[1]?.toUpperCase();
    return romanNumeral ? `Generation ${romanNumeral}` : this.formatName(move.generation.name);
  });

  readonly damageClassDisplayName = computed(() => {
    const move = this.move();
    return move ? this.formatName(move.damage_class.name) : '';
  });

  readonly damageClassIcon = computed(() =>
    this.getMoveCategoryIcon(this.move()?.damage_class.name)
  );

  readonly targetLabel = computed(() => {
    const move = this.move();
    return move ? this.formatName(move.target.name) : '';
  });

  readonly englishShortEffect = computed(() => {
    const move = this.move();
    if (!move) {
      return '';
    }

    const effectEntry = move.effect_entries.find((entry) => entry.language.name === 'en');
    return this.applyEffectChance(effectEntry?.short_effect || '', move.effect_chance);
  });

  // Only shown when it adds information beyond the short effect, to avoid
  // rendering the same text twice (PokeAPI sometimes leaves `effect` blank).
  readonly englishDetailedEffect = computed(() => {
    const move = this.move();
    if (!move) {
      return '';
    }

    const effectEntry = move.effect_entries.find((entry) => entry.language.name === 'en');
    const effect = this.applyEffectChance(effectEntry?.effect || '', move.effect_chance);
    return effect && effect !== this.englishShortEffect() ? effect : '';
  });

  readonly hasNoEffectInfo = computed(() => {
    return !this.englishShortEffect() && !this.englishDetailedEffect();
  });

  readonly englishFlavorText = computed(() => {
    const move = this.move();
    if (!move) {
      return '';
    }

    return (
      move.flavor_text_entries.find((entry) => entry.language.name === 'en')?.flavor_text ?? ''
    );
  });

  readonly metaRows = computed<MoveMetaRow[]>(() => {
    const meta = this.move()?.meta;
    if (!meta) {
      return [];
    }

    const rows: MoveMetaRow[] = [];

    if (meta.ailment.name !== 'none') {
      rows.push({
        label: 'Ailment',
        value:
          meta.ailment_chance > 0
            ? `${this.formatName(meta.ailment.name)} (${meta.ailment_chance}%)`
            : this.formatName(meta.ailment.name),
      });
    }
    if (meta.min_hits !== null && meta.max_hits !== null) {
      rows.push({
        label: 'Hits',
        value:
          meta.min_hits === meta.max_hits
            ? `${meta.min_hits}`
            : `${meta.min_hits}-${meta.max_hits}`,
      });
    }
    if (meta.min_turns !== null && meta.max_turns !== null) {
      rows.push({
        label: 'Turns',
        value:
          meta.min_turns === meta.max_turns
            ? `${meta.min_turns}`
            : `${meta.min_turns}-${meta.max_turns}`,
      });
    }
    if (meta.drain !== 0) {
      rows.push({ label: meta.drain > 0 ? 'Drain' : 'Recoil', value: `${Math.abs(meta.drain)}%` });
    }
    if (meta.healing !== 0) {
      rows.push({ label: 'Healing', value: `${meta.healing}%` });
    }
    if (meta.crit_rate !== 0) {
      rows.push({ label: 'Critical Hit Rate', value: `+${meta.crit_rate}` });
    }
    if (meta.flinch_chance > 0) {
      rows.push({ label: 'Flinch Chance', value: `${meta.flinch_chance}%` });
    }
    if (meta.stat_chance > 0) {
      rows.push({ label: 'Stat Chance', value: `${meta.stat_chance}%` });
    }

    return rows;
  });

  readonly statChangeLabels = computed<StatChangeLabel[]>(() => {
    const statChanges = this.move()?.stat_changes ?? [];
    return statChanges.map((statChange) => this.formatStatChange(statChange));
  });

  readonly machineVersionGroupLabels = computed(() => {
    const move = this.move();
    if (!move) {
      return [];
    }
    return [...new Set(move.machines.map((entry) => this.formatName(entry.version_group.name)))];
  });

  readonly learnedByPokemon = computed(() => {
    const move = this.move();
    if (!move) {
      return [];
    }

    return [...move.learned_by_pokemon].sort((a, b) => a.name.localeCompare(b.name));
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const moveName = params.get('name');
      if (!moveName) {
        this.move.set(null);
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);
      this.pokemonService
        .getMoveByName(moveName)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((move) => {
          this.move.set(move);
          this.isLoading.set(false);
        });
    });
  }

  getSpriteUrl(pokemonUrl: string): string {
    const id = pokemonUrl.split('/').filter(Boolean).pop() || '0';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  getMoveCategoryIcon(damageClassKey: string | undefined): string {
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

  formatStatValue(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : `${value}`;
  }

  onLearnedByPokemonClick(event: MouseEvent, pokemonName: string): void {
    event.preventDefault();
    event.stopPropagation();

    const cachedSpeciesName = this.speciesNameByPokemonName()[pokemonName];
    if (cachedSpeciesName) {
      this.navigateToSpecies(cachedSpeciesName);
      return;
    }

    this.pokemonService
      .getPokemonByName(pokemonName)
      .pipe(
        take(1),
        catchError(() => of(null))
      )
      .subscribe((pokemon) => {
        const speciesName = pokemon?.species?.name ?? pokemonName;

        this.speciesNameByPokemonName.update((mapping) => ({
          ...mapping,
          [pokemonName]: speciesName,
        }));

        this.navigateToSpecies(speciesName);
      });
  }

  private formatStatChange(statChange: MoveStatChange): StatChangeLabel {
    const sign = statChange.change > 0 ? '+' : '';
    return {
      label: `${sign}${statChange.change} ${this.formatName(statChange.stat.name)}`,
      isPositive: statChange.change > 0,
    };
  }

  private applyEffectChance(text: string, effectChance: number | null): string {
    if (!text) {
      return text;
    }
    return text.replace('$effect_chance', effectChance !== null ? `${effectChance}` : '');
  }

  private navigateToSpecies(speciesName: string): void {
    void this.router.navigate(['/pokedex', 'national', 'national', speciesName]);
  }

  private formatName(name: string): string {
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
