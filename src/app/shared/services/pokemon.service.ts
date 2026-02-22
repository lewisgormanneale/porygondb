import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Ability,
  NamedAPIResourceList,
  Pokemon,
  PokemonSpecies,
  Stat,
  Type,
} from '../interfaces/pokeapi';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly http = inject(HttpClient);

  getPokemonByName(name: string): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${POKEAPI_BASE_URL}/pokemon/${name}`);
  }

  getPokemonById(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${POKEAPI_BASE_URL}/pokemon/${id}`);
  }

  getPokemonSpeciesByName(name: string): Observable<PokemonSpecies> {
    return this.http.get<PokemonSpecies>(`${POKEAPI_BASE_URL}/pokemon-species/${name}`);
  }

  getPokemonSpeciesById(id: number): Observable<PokemonSpecies> {
    return this.http.get<PokemonSpecies>(`${POKEAPI_BASE_URL}/pokemon-species/${id}`);
  }

  getAbilityByName(name: string): Observable<Ability> {
    return this.http.get<Ability>(`${POKEAPI_BASE_URL}/ability/${name}`);
  }

  getAbilityById(id: number): Observable<Ability> {
    return this.http.get<Ability>(`${POKEAPI_BASE_URL}/ability/${id}`);
  }

  getStatByName(name: string): Observable<Stat> {
    return this.http.get<Stat>(`${POKEAPI_BASE_URL}/stat/${name}`);
  }

  getStatById(id: number): Observable<Stat> {
    return this.http.get<Stat>(`${POKEAPI_BASE_URL}/stat/${id}`);
  }

  getTypeByName(name: string): Observable<Type> {
    return this.http.get<Type>(`${POKEAPI_BASE_URL}/type/${name}`);
  }

  getTypeById(id: number): Observable<Type> {
    return this.http.get<Type>(`${POKEAPI_BASE_URL}/type/${id}`);
  }

  listPokemonSpecies(offset?: number, limit?: number): Observable<NamedAPIResourceList> {
    const params: Record<string, string> = {};
    if (offset !== undefined) params['offset'] = offset.toString();
    if (limit !== undefined) params['limit'] = limit.toString();
    return this.http.get<NamedAPIResourceList>(`${POKEAPI_BASE_URL}/pokemon-species`, { params });
  }

  listStats(offset?: number, limit?: number): Observable<NamedAPIResourceList> {
    const params: Record<string, string> = {};
    if (offset !== undefined) params['offset'] = offset.toString();
    if (limit !== undefined) params['limit'] = limit.toString();
    return this.http.get<NamedAPIResourceList>(`${POKEAPI_BASE_URL}/stat`, { params });
  }
}
