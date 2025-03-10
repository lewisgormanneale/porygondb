import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from "@angular/material/chips";
import { getPokemonTypeColor } from "src/app/shared/utils/get-type-color.util";

@Component({
  selector: "lib-pokemon-type-chip",
  imports: [CommonModule, MatChipsModule],
  templateUrl: "./pokemon-type-chip.component.html",
  styleUrl: "./pokemon-type-chip.component.scss",
})
export class PokemonTypeChipComponent {
  typeName = input.required<string>();

  getTypeColor(typeName: string): string {
    return getPokemonTypeColor(typeName);
  }
}
