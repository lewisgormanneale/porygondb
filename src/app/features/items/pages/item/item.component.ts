import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { catchError, of, take } from 'rxjs';
import { Item, ItemHolderPokemon } from '../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { CleanFlavorTextPipe } from '../../../../shared/pipes/cleanFlavorText.pipe';

export const FALLBACK_ITEM_SPRITE_URL = 'assets/images/question-mark.png';

interface ItemPriceRow {
  versionGroupDisplayName: string;
  purchasePriceLabel: string;
  sellPriceLabel: string;
}

@Component({
  selector: 'app-item',
  imports: [MatCardModule, MatChipsModule, MatProgressBarModule, RouterModule, CleanFlavorTextPipe],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
})
export class ItemComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pokemonService = inject(PokemonService);
  private readonly destroyRef = inject(DestroyRef);

  readonly FALLBACK_ITEM_SPRITE_URL = FALLBACK_ITEM_SPRITE_URL;

  readonly isLoading = signal(true);
  readonly item = signal<Item | null>(null);
  readonly speciesNameByPokemonName = signal<Record<string, string>>({});

  readonly displayName = computed(() => {
    const item = this.item();
    if (!item) {
      return '';
    }

    const englishName = item.names.find((entry) => entry.language.name === 'en')?.name;
    return englishName || this.formatName(item.name);
  });

  readonly categoryLabel = computed(() => {
    const item = this.item();
    return item ? this.formatName(item.category.name) : '';
  });

  readonly spriteUrl = computed(() => this.item()?.sprites.default ?? null);

  readonly englishFlavorText = computed(() => {
    const item = this.item();
    if (!item) {
      return '';
    }

    return item.flavor_text_entries.find((entry) => entry.language.name === 'en')?.text ?? '';
  });

  readonly englishShortEffect = computed(() => {
    const item = this.item();
    if (!item) {
      return '';
    }

    const effectEntry = item.effect_entries.find((entry) => entry.language.name === 'en');
    return effectEntry?.short_effect || '';
  });

  // Only shown when it adds information beyond the short effect, to avoid
  // rendering the same text twice (PokeAPI sometimes leaves `effect` blank).
  readonly englishDetailedEffect = computed(() => {
    const item = this.item();
    if (!item) {
      return '';
    }

    const effectEntry = item.effect_entries.find((entry) => entry.language.name === 'en');
    const effect = effectEntry?.effect || '';
    return effect && effect !== this.englishShortEffect() ? effect : '';
  });

  readonly hasNoEffectInfo = computed(() => {
    return !this.englishShortEffect() && !this.englishDetailedEffect();
  });

  readonly priceEntries = computed<ItemPriceRow[]>(() => {
    const item = this.item();
    if (!item) {
      return [];
    }

    return item.prices.map((price) => ({
      versionGroupDisplayName: this.formatName(price.version_group.name),
      purchasePriceLabel:
        price.purchase_price !== null ? `₽${price.purchase_price.toLocaleString()}` : '—',
      sellPriceLabel: price.sell_price !== null ? `₽${price.sell_price.toLocaleString()}` : '—',
    }));
  });

  readonly hasBabyTrigger = computed(() => !!this.item()?.baby_trigger_for);

  readonly machineVersionGroupLabels = computed(() => {
    const item = this.item();
    if (!item) {
      return [];
    }
    return [...new Set(item.machines.map((entry) => this.formatName(entry.version_group.name)))];
  });

  readonly generationLabels = computed(() => {
    const item = this.item();
    if (!item) {
      return [];
    }
    return [
      ...new Set(item.game_indices.map((entry) => this.formatGenerationName(entry.generation.name))),
    ];
  });

  readonly flingPowerLabel = computed(() => {
    const item = this.item();
    if (!item || item.fling_power === null) {
      return '';
    }
    return item.fling_effect
      ? `${item.fling_power} (${this.formatName(item.fling_effect.name)})`
      : `${item.fling_power}`;
  });

  readonly attributeLabels = computed(() => {
    const item = this.item();
    return item ? item.attributes.map((attribute) => this.formatName(attribute.name)) : [];
  });

  readonly heldByPokemon = computed<ItemHolderPokemon[]>(() => {
    const item = this.item();
    if (!item) {
      return [];
    }

    return [...item.held_by_pokemon].sort((a, b) => a.pokemon.name.localeCompare(b.pokemon.name));
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const itemName = params.get('name');
      if (!itemName) {
        this.item.set(null);
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);
      this.pokemonService
        .getItemByName(itemName)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((item) => {
          this.item.set(item);
          this.isLoading.set(false);
        });
    });
  }

  getPokemonSpriteUrl(pokemonUrl: string): string {
    const id = pokemonUrl.split('/').filter(Boolean).pop() || '0';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  onHolderPokemonClick(event: MouseEvent, pokemonName: string): void {
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

  private navigateToSpecies(speciesName: string): void {
    void this.router.navigate(['/pokedex', 'national', 'national', speciesName]);
  }

  private formatName(name: string): string {
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private formatGenerationName(name: string): string {
    const romanNumeral = name.split('-')[1]?.toUpperCase();
    return romanNumeral ? `Generation ${romanNumeral}` : this.formatName(name);
  }
}
