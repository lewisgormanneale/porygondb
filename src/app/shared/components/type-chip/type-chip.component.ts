import { Component, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from "@angular/material/chips";
import { getPokemonTypeColor } from "../../utils/get-type-color.util";
import { ThemeStore } from "../../../core/+state/theme.store";
import { darkenColor } from "../../utils/darken-color.util";

@Component({
  selector: "type-chip",
  imports: [CommonModule, MatChipsModule],
  templateUrl: "./type-chip.component.html",
  styleUrl: "./type-chip.component.scss",
})
export class TypeChipComponent {
  typeName = input.required<string>();
  themeStore = inject(ThemeStore);

  getTypeColor(typeName: string): string {
    const color = getPokemonTypeColor(typeName);
    if (this.themeStore.isDarkTheme()) {
      return darkenColor(color, 20);
    }
    return color;
  }
}
