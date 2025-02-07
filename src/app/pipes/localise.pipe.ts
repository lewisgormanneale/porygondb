import { Pipe, PipeTransform } from "@angular/core";
import { PokemonSpeciesName } from "../models/pokemon.model";

@Pipe({
  name: "localise",
})
export class LocalisePipe implements PipeTransform {
  transform(names: PokemonSpeciesName[], language: string): string {
    const name = names.find((name) => name.language.name === language);
    return name ? name.name : "";
  }
}
