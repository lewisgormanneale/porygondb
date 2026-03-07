import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Generation,
  NamedAPIResourceList,
  Pokedex,
  Version,
  VersionGroup,
} from '../interfaces/pokeapi';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly http = inject(HttpClient);

  getGenerationByName(name: string): Observable<Generation> {
    return this.http.get<Generation>(`${POKEAPI_BASE_URL}/generation/${name}`);
  }

  getGenerationById(id: number): Observable<Generation> {
    return this.http.get<Generation>(`${POKEAPI_BASE_URL}/generation/${id}`);
  }

  getPokedexByName(name: string): Observable<Pokedex> {
    return this.http.get<Pokedex>(`${POKEAPI_BASE_URL}/pokedex/${name}`);
  }

  getPokedexById(id: number): Observable<Pokedex> {
    return this.http.get<Pokedex>(`${POKEAPI_BASE_URL}/pokedex/${id}`);
  }

  getVersionByName(name: string): Observable<Version> {
    return this.http.get<Version>(`${POKEAPI_BASE_URL}/version/${name}`);
  }

  getVersionById(id: number): Observable<Version> {
    return this.http.get<Version>(`${POKEAPI_BASE_URL}/version/${id}`);
  }

  getVersionGroupByName(name: string): Observable<VersionGroup> {
    return this.http.get<VersionGroup>(`${POKEAPI_BASE_URL}/version-group/${name}`);
  }

  getVersionGroupById(id: number): Observable<VersionGroup> {
    return this.http.get<VersionGroup>(`${POKEAPI_BASE_URL}/version-group/${id}`);
  }

  listPokedexes(): Observable<NamedAPIResourceList> {
    return this.http.get<NamedAPIResourceList>(`${POKEAPI_BASE_URL}/pokedex`, {
      params: { offset: '0', limit: '1000' },
    });
  }

  listVersions(): Observable<NamedAPIResourceList> {
    return this.http.get<NamedAPIResourceList>(`${POKEAPI_BASE_URL}/version`, {
      params: { offset: '0', limit: '1000' },
    });
  }

  listVersionGroups(): Observable<NamedAPIResourceList> {
    return this.http.get<NamedAPIResourceList>(`${POKEAPI_BASE_URL}/version-group`, {
      params: { offset: '0', limit: '1000' },
    });
  }
}
