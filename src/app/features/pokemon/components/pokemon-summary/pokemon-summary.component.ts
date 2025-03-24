import { NgOptimizedImage } from "@angular/common";
import { Component, effect, inject, signal } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatGridListModule } from "@angular/material/grid-list";
import { LocalisePipe } from "../../../../shared/pipes/localise.pipe";
import { TypeChipComponent } from "../../../../shared/components/type-chip/type-chip.component";
import { PokemonStore } from "../../../../shared/store/pokemon.store";
import { DecimetersToInchesPipe } from "../../../../shared/pipes/decimetersToInches.pipe";
import { HectogramsToPoundsPipe } from "../../../../shared/pipes/hectogramsToPounds.pipe";
import { Ability } from "pokenode-ts";
import { PokemonService } from "../../../../shared/services/pokemon.service";
import { MatDividerModule } from "@angular/material/divider";

interface AbilityInformation {
  ability: Ability;
  isHidden: boolean;
  slot: number;
}

@Component({
  selector: "pokemon-summary",
  imports: [
    MatCardModule,
    MatChipsModule,
    LocalisePipe,
    NgOptimizedImage,
    MatGridListModule,
    MatDividerModule,
    TypeChipComponent,
    DecimetersToInchesPipe,
    HectogramsToPoundsPipe,
  ],
  templateUrl: "./pokemon-summary.component.html",
  styleUrl: "./pokemon-summary.component.scss",
})
export class PokemonSummaryComponent {
  readonly abilities = signal<AbilityInformation[]>([]);
  readonly pokemonStore = inject(PokemonStore);
  readonly pokemonService = inject(PokemonService);

  constructor() {
    effect(() => {
      if (
        this.pokemonStore.selectedEntity()?.abilities &&
        this.pokemonStore.selectedEntity()!.abilities!.length > 0
      ) {
        this.abilities.set([]);
        this.pokemonStore.selectedEntity()!.abilities.map((pokemonAbility) => {
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

  setSelectedPokemonVariety(varietyId: number) {
    this.pokemonStore.setSelectedId(varietyId);
  }
}
