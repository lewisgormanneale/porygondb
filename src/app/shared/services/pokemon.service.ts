import { Injectable } from "@angular/core";
import {
  Ability,
  NamedAPIResourceList,
  Pokemon,
  PokemonClient,
  PokemonSpecies,
  Stat,
  Type,
} from "pokenode-ts";
import { from, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PokemonService {
  private readonly pokemonClient: PokemonClient;

  constructor() {
    this.pokemonClient = new PokemonClient();
  }

  getPokemonByName(name: string): Observable<Pokemon> {
    return from(this.pokemonClient.getPokemonByName(name));
  }

  getPokemonById(id: number): Observable<Pokemon> {
    return from(this.pokemonClient.getPokemonById(id));
  }

  getPokemonSpeciesByName(name: string): Observable<PokemonSpecies> {
    return from(this.pokemonClient.getPokemonSpeciesByName(name));
  }

  getPokemonSpeciesById(id: number): Observable<PokemonSpecies> {
    return from(this.pokemonClient.getPokemonSpeciesById(id));
  }

  getAbilityByName(name: string): Observable<Ability> {
    return from(this.pokemonClient.getAbilityByName(name));
  }

  getAbilityById(id: number): Observable<Ability> {
    return from(this.pokemonClient.getAbilityById(id));
  }

  getStatByName(name: string): Observable<Stat> {
    return from(this.pokemonClient.getStatByName(name));
  }

  getStatById(id: number): Observable<Stat> {
    return from(this.pokemonClient.getStatById(id));
  }

  getTypeByName(name: string): Observable<Type> {
    return from(this.pokemonClient.getTypeByName(name));
  }

  getTypeById(id: number): Observable<Type> {
    return from(this.pokemonClient.getTypeById(id));
  }

  listPokemonSpecies(
    offset?: number,
    limit?: number
  ): Observable<NamedAPIResourceList> {
    return from(this.pokemonClient.listPokemonSpecies(offset, limit));
  }

  listStats(offset?: number, limit?: number): Observable<NamedAPIResourceList> {
    return from(this.pokemonClient.listStats(offset, limit));
  }
}
