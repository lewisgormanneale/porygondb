import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "hectogramsToPounds",
})
export class HectogramsToPoundsPipe implements PipeTransform {
  private readonly POUNDS_PER_HECTOGRAM = 0.220462;

  transform(value: number): string {
    if (isNaN(value) || value < 0) {
      return "Invalid input";
    }

    const pounds = value * this.POUNDS_PER_HECTOGRAM;
    return `${pounds.toFixed(1)} lbs`;
  }
}
