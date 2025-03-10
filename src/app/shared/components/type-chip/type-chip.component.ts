import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from "@angular/material/chips";
import { getPokemonTypeColor } from "src/app/shared/utils/get-type-color.util";

@Component({
  selector: "type-chip",
  imports: [CommonModule, MatChipsModule],
  templateUrl: "./type-chip.component.html",
  styleUrl: "./type-chip.component.scss",
})
export class TypeChipComponent {
  typeName = input.required<string>();

  getTypeColor(typeName: string): string {
    return getPokemonTypeColor(typeName);
  }
}
