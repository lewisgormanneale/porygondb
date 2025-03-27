import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "genderRate",
})
export class GenderRatePipe implements PipeTransform {
  // This returns the chance of a Pokemon being male. See https://pokeapi.co/docs/v2#genders
  transform(rate: number): number {
    return ((8 - rate) / 8) * 100;
  }
}
