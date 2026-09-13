import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Ability, AbilityPokemon } from '../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { CleanFlavorTextPipe } from '../../../../shared/pipes/cleanFlavorText.pipe';
import { catchError, of, take } from 'rxjs';

@Component({
  selector: 'app-ability',
  imports: [MatCardModule, MatProgressBarModule, RouterModule, CleanFlavorTextPipe],
  templateUrl: './ability.component.html',
  styleUrl: './ability.component.scss',
})
export class AbilityComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pokemonService = inject(PokemonService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly ability = signal<Ability | null>(null);
  readonly speciesNameByPokemonName = signal<Record<string, string>>({});

  readonly displayName = computed(() => {
    const ability = this.ability();
    if (!ability) {
      return '';
    }

    const englishName = ability.names.find((entry) => entry.language.name === 'en')?.name;
    return englishName || this.formatName(ability.name);
  });

  readonly generationLabel = computed(() => {
    const ability = this.ability();
    if (!ability) {
      return '';
    }

    const romanNumeral = ability.generation.name.split('-')[1]?.toUpperCase();
    return romanNumeral ? `Generation ${romanNumeral}` : this.formatName(ability.generation.name);
  });

  readonly englishFlavorText = computed(() => {
    const ability = this.ability();
    if (!ability) {
      return '';
    }

    return (
      ability.flavor_text_entries.find((entry) => entry.language.name === 'en')?.flavor_text ?? ''
    );
  });

  readonly englishShortEffect = computed(() => {
    const ability = this.ability();
    if (!ability) {
      return '';
    }

    const effectEntry = ability.effect_entries.find((entry) => entry.language.name === 'en');
    return effectEntry?.short_effect || '';
  });

  // Only shown when it adds information beyond the short effect, to avoid
  // rendering the same text twice (PokeAPI sometimes leaves `effect` blank).
  readonly englishDetailedEffect = computed(() => {
    const ability = this.ability();
    if (!ability) {
      return '';
    }

    const effectEntry = ability.effect_entries.find((entry) => entry.language.name === 'en');
    const effect = effectEntry?.effect || '';
    return effect && effect !== this.englishShortEffect() ? effect : '';
  });

  readonly hasNoEffectInfo = computed(() => {
    return !this.englishShortEffect() && !this.englishDetailedEffect();
  });

  readonly normalAbilityPokemon = computed(() => {
    return this.groupedPokemon(false);
  });

  readonly hiddenAbilityPokemon = computed(() => {
    return this.groupedPokemon(true);
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const abilityName = params.get('name');
      if (!abilityName) {
        this.ability.set(null);
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);
      this.pokemonService
        .getAbilityByName(abilityName)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((ability) => {
          this.ability.set(ability);
          this.isLoading.set(false);
        });
    });
  }

  getSpriteUrl(pokemonUrl: string): string {
    const id = pokemonUrl.split('/').filter(Boolean).pop() || '0';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  onAbilityPokemonClick(event: MouseEvent, pokemonName: string): void {
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

  private groupedPokemon(isHidden: boolean): AbilityPokemon[] {
    const ability = this.ability();
    if (!ability) {
      return [];
    }

    return ability.pokemon
      .filter((entry) => entry.is_hidden === isHidden)
      .sort((a, b) => a.pokemon.name.localeCompare(b.pokemon.name));
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
