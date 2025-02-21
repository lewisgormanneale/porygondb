import { Injectable } from '@angular/core';
import {
  Ability,
  Pokemon,
  PokemonClient,
  PokemonSpecies,
  Type,
} from 'pokenode-ts';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
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

  getTypeByName(name: string): Observable<Type> {
    return from(this.pokemonClient.getTypeByName(name));
  }

  getTypeById(id: number): Observable<Type> {
    return from(this.pokemonClient.getTypeById(id));
  }
}
