import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Ability, AbilityPokemon } from '../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../shared/services/pokemon.service';

@Component({
  selector: 'app-ability',
  imports: [MatCardModule, MatProgressBarModule, RouterModule],
  templateUrl: './ability.component.html',
  styleUrl: './ability.component.scss',
})
export class AbilityComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly pokemonService = inject(PokemonService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly ability = signal<Ability | null>(null);

  readonly displayName = computed(() => {
    const ability = this.ability();
    if (!ability) {
      return '';
    }

    const englishName = ability.names.find((entry) => entry.language.name === 'en')?.name;
    return englishName || this.formatName(ability.name);
  });

  readonly englishEffect = computed(() => {
    const ability = this.ability();
    if (!ability) {
      return '';
    }

    const effectEntry = ability.effect_entries.find((entry) => entry.language.name === 'en');
    return effectEntry?.effect || effectEntry?.short_effect || 'No English effect available.';
  });

  readonly englishShortEffect = computed(() => {
    const ability = this.ability();
    if (!ability) {
      return '';
    }

    const effectEntry = ability.effect_entries.find((entry) => entry.language.name === 'en');
    return effectEntry?.short_effect || '';
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

  private groupedPokemon(isHidden: boolean): AbilityPokemon[] {
    const ability = this.ability();
    if (!ability) {
      return [];
    }

    return ability.pokemon
      .filter((entry) => entry.is_hidden === isHidden)
      .sort((a, b) => a.pokemon.name.localeCompare(b.pokemon.name));
  }

  private formatName(name: string): string {
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
