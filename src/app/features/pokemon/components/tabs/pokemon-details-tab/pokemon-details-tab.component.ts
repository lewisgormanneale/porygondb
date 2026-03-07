import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { forkJoin, map, of, switchMap } from 'rxjs';

import { PokemonStore } from '../../../../../shared/+state/pokemon.store';
import { DecimetersToInchesPipe } from '../../../../../shared/pipes/decimetersToInches.pipe';
import { HectogramsToPoundsPipe } from '../../../../../shared/pipes/hectogramsToPounds.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { LocalisePipe } from '../../../../../shared/pipes/localise.pipe';
import { MatChipsModule } from '@angular/material/chips';
import { Ability, PokemonAbility } from '../../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../../shared/services/pokemon.service';
import { TypeChipComponent } from '../../../../../shared/components/type-chip/type-chip.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GenderRatePipe } from '../../../../../shared/pipes/genderRate.pipe';
import { CleanFlavorTextPipe } from '../../../../../shared/pipes/cleanFlavorText.pipe';

interface AbilityInformation {
  ability: Ability;
  isHidden: boolean;
  slot: number;
}

@Component({
  selector: 'pokemon-details-tab',
  imports: [
    DecimetersToInchesPipe,
    HectogramsToPoundsPipe,
    MatDividerModule,
    LocalisePipe,
    MatChipsModule,
    MatProgressBarModule,
    TypeChipComponent,
    GenderRatePipe,
    CleanFlavorTextPipe,
  ],
  templateUrl: './pokemon-details-tab.component.html',
  styleUrl: './pokemon-details-tab.component.scss',
})
export class PokemonDetailsTabComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly abilities = signal<AbilityInformation[]>([]);
  readonly pokemonService = inject(PokemonService);
  readonly destroyRef = inject(DestroyRef);
  readonly selectedEntity$ = toObservable(this.pokemonStore.selectedEntity);

  constructor() {
    this.selectedEntity$
      .pipe(
        map((selectedEntity) => selectedEntity?.abilities ?? []),
        switchMap((pokemonAbilities: PokemonAbility[]) => {
          if (!pokemonAbilities.length) {
            return of<AbilityInformation[]>([]);
          }

          return forkJoin(
            pokemonAbilities.map((pokemonAbility) =>
              this.pokemonService.getAbilityByName(pokemonAbility.ability.name).pipe(
                map((ability: Ability) => ({
                  ability,
                  slot: pokemonAbility.slot,
                  isHidden: pokemonAbility.is_hidden,
                }))
              )
            )
          ).pipe(map((abilities) => abilities.sort((a, b) => a.slot - b.slot)));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((abilities) => {
        this.abilities.set(abilities);
      });
  }
}
