import { Component, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from "@angular/material/chips";
import { getPokemonTypeColor } from "../../utils/get-type-color.util";
import { ThemeStore } from "../../../core/store/theme.store";

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
      return this.darkenColor(color, 20); // Darken color by 20% (you can adjust the percentage)
    }
    return color;
  }

  private darkenColor(color: string, percentage: number): string {
    // Extract RGB values from hex color
    const num = parseInt(color.replace("#", ""), 16);
    const r = (num >> 16) - (num >> 16) * (percentage / 100);
    const g =
      ((num >> 8) & 0x00ff) - ((num >> 8) & 0x00ff) * (percentage / 100);
    const b = (num & 0x0000ff) - (num & 0x0000ff) * (percentage / 100);

    // Ensure values stay within 0-255 and convert back to hex
    const darkenedColor =
      "#" +
      [r, g, b]
        .map(
          (channel) =>
            Math.max(0, Math.min(255, Math.round(channel))) // Clamp RGB values between 0 and 255
              .toString(16)
              .padStart(2, "0") // Ensure two characters for each channel
        )
        .join("");

    return darkenedColor;
  }
}
