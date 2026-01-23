import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonStore } from '../../../../../shared/+state/pokemon.store';
import { DecimetersToInchesPipe } from '../../../../../shared/pipes/decimetersToInches.pipe';
import { HectogramsToPoundsPipe } from '../../../../../shared/pipes/hectogramsToPounds.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { CaptureRatePipe } from '../../../../../shared/pipes/captureRate.pipe';
import { LocalisePipe } from '../../../../../shared/pipes/localise.pipe';
import { MatChipsModule } from '@angular/material/chips';
import { Ability } from 'pokenode-ts';
import { PokemonService } from '../../../../../shared/services/pokemon.service';
import { TypeChipComponent } from '../../../../../shared/components/type-chip/type-chip.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GenderRatePipe } from '../../../../../shared/pipes/genderRate.pipe';

interface AbilityInformation {
  ability: Ability;
  isHidden: boolean;
  slot: number;
}

@Component({
  selector: 'pokemon-details-tab',
  imports: [
    CommonModule,
    DecimetersToInchesPipe,
    HectogramsToPoundsPipe,
    MatDividerModule,
    CaptureRatePipe,
    LocalisePipe,
    MatChipsModule,
    MatProgressBarModule,
    TypeChipComponent,
    GenderRatePipe,
  ],
  templateUrl: './pokemon-details-tab.component.html',
  styleUrl: './pokemon-details-tab.component.scss',
})
export class PokemonDetailsTabComponent {
  readonly pokemonStore = inject(PokemonStore);
  readonly abilities = signal<AbilityInformation[]>([]);
  readonly pokemonService = inject(PokemonService);

  constructor() {
    effect(() => {
      const selectedEntity = this.pokemonStore.selectedEntity();
      if (selectedEntity?.abilities?.length) {
        this.abilities.set([]);
        selectedEntity.abilities.forEach((pokemonAbility) => {
          this.pokemonService
            .getAbilityByName(pokemonAbility.ability.name)
            .subscribe((ability: Ability) => {
              this.abilities.update((currentAbilities) =>
                [
                  ...currentAbilities,
                  {
                    ability,
                    slot: pokemonAbility.slot,
                    isHidden: pokemonAbility.is_hidden,
                  },
                ].sort((a, b) => a.slot - b.slot)
              );
            });
        });
      } else {
        this.abilities.set([]);
      }
    });
  }
}
