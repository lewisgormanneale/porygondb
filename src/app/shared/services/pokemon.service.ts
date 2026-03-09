import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Ability,
  EvolutionChain,
  Move,
  NamedAPIResourceList,
  Pokemon,
  PokemonForm,
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
    return this.http.get<Pokemon>(`${POKEAPI_BASE_URL}/pokemon/${encodeURIComponent(name)}`);
  }

  getPokemonById(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${POKEAPI_BASE_URL}/pokemon/${id}`);
  }

  getPokemonFormByName(name: string): Observable<PokemonForm> {
    return this.http.get<PokemonForm>(
      `${POKEAPI_BASE_URL}/pokemon-form/${encodeURIComponent(name)}`
    );
  }

  getPokemonSpeciesByName(name: string): Observable<PokemonSpecies> {
    return this.http.get<PokemonSpecies>(
      `${POKEAPI_BASE_URL}/pokemon-species/${encodeURIComponent(name)}`
    );
  }

  getPokemonSpeciesById(id: number): Observable<PokemonSpecies> {
    return this.http.get<PokemonSpecies>(`${POKEAPI_BASE_URL}/pokemon-species/${id}`);
  }

  getAbilityByName(name: string): Observable<Ability> {
    return this.http.get<Ability>(`${POKEAPI_BASE_URL}/ability/${encodeURIComponent(name)}`);
  }

  getAbilityById(id: number): Observable<Ability> {
    return this.http.get<Ability>(`${POKEAPI_BASE_URL}/ability/${id}`);
  }

  getMoveByName(name: string): Observable<Move> {
    return this.http.get<Move>(`${POKEAPI_BASE_URL}/move/${encodeURIComponent(name)}`);
  }

  getStatByName(name: string): Observable<Stat> {
    return this.http.get<Stat>(`${POKEAPI_BASE_URL}/stat/${encodeURIComponent(name)}`);
  }

  getStatById(id: number): Observable<Stat> {
    return this.http.get<Stat>(`${POKEAPI_BASE_URL}/stat/${id}`);
  }

  getTypeByName(name: string): Observable<Type> {
    return this.http.get<Type>(`${POKEAPI_BASE_URL}/type/${encodeURIComponent(name)}`);
  }

  getTypeById(id: number): Observable<Type> {
    return this.http.get<Type>(`${POKEAPI_BASE_URL}/type/${id}`);
  }

  getEvolutionChainById(id: number): Observable<EvolutionChain> {
    return this.http.get<EvolutionChain>(`${POKEAPI_BASE_URL}/evolution-chain/${id}`);
  }

  getEvolutionChainByUrl(url: string): Observable<EvolutionChain> {
    return this.http.get<EvolutionChain>(url);
  }

  getPokemonEncountersByUrl(url: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(url);
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

  listAbilities(offset?: number, limit?: number): Observable<NamedAPIResourceList> {
    const params: Record<string, string> = {};
    if (offset !== undefined) params['offset'] = offset.toString();
    if (limit !== undefined) params['limit'] = limit.toString();
    return this.http.get<NamedAPIResourceList>(`${POKEAPI_BASE_URL}/ability`, { params });
  }
}
