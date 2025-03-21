import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "decimetersToInches",
})
export class DecimetersToInchesPipe implements PipeTransform {
  private readonly INCHES_PER_DECIMETER = 3.937;
  private readonly INCHES_PER_FOOT = 12;

  transform(value: number): string {
    if (isNaN(value) || value < 0) {
      return "Invalid input";
    }

    const totalInches = Math.round(value * this.INCHES_PER_DECIMETER);
    const feet = Math.floor(totalInches / this.INCHES_PER_FOOT);
    const inches = totalInches % this.INCHES_PER_FOOT;

    return `${feet}'${inches}"`;
  }
}
