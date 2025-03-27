import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PokemonStore } from "../../../../../shared/store/pokemon.store";
import { DecimetersToInchesPipe } from "../../../../../shared/pipes/decimetersToInches.pipe";
import { HectogramsToPoundsPipe } from "../../../../../shared/pipes/hectogramsToPounds.pipe";
import { MatDividerModule } from "@angular/material/divider";
import { CaptureRatePipe } from "../../../../../shared/pipes/captureRate.pipe";

@Component({
  selector: "pokemon-details-tab",
  imports: [
    CommonModule,
    DecimetersToInchesPipe,
    HectogramsToPoundsPipe,
    MatDividerModule,
    CaptureRatePipe,
  ],
  templateUrl: "./pokemon-details-tab.component.html",
  styleUrl: "./pokemon-details-tab.component.scss",
})
export class PokemonDetailsTabComponent {
  readonly pokemonStore = inject(PokemonStore);
}
