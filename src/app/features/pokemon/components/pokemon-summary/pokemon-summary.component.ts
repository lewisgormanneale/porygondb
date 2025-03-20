import { NgOptimizedImage } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatGridListModule } from "@angular/material/grid-list";
import { LocalisePipe } from "../../../../shared/pipes/localise.pipe";
import { TypeChipComponent } from "../../../../shared/components/type-chip/type-chip.component";
import { PokemonStore } from "../../../../shared/store/pokemon.store";
import { DecimetersToInchesPipe } from "../../../../shared/pipes/decimetersToInches.pipe";
import { HectogramsToPoundsPipe } from "../../../../shared/pipes/hectogramsToPounds.pipe";

@Component({
  selector: "pokemon-summary",
  imports: [
    MatCardModule,
    MatChipsModule,
    LocalisePipe,
    NgOptimizedImage,
    MatGridListModule,
    TypeChipComponent,
    DecimetersToInchesPipe,
    HectogramsToPoundsPipe,
  ],
  templateUrl: "./pokemon-summary.component.html",
  styleUrl: "./pokemon-summary.component.scss",
})
export class PokemonSummaryComponent {
  readonly pokemonStore = inject(PokemonStore);

  setSelectedPokemonVariety(varietyId: number) {
    this.pokemonStore.setSelectedId(varietyId);
  }
}
