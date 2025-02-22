import { Injectable } from '@angular/core';
import {
  GameClient,
  Generation,
  NamedAPIResourceList,
  Pokedex,
  Version,
  VersionGroup,
} from 'pokenode-ts';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly gameClient: GameClient;

  constructor() {
    this.gameClient = new GameClient();
  }

  getGenerationByName(name: string): Observable<Generation> {
    return from(this.gameClient.getGenerationByName(name));
  }

  getGenerationById(id: number): Observable<Generation> {
    return from(this.gameClient.getGenerationById(id));
  }

  getPokedexByName(name: string): Observable<Pokedex> {
    return from(this.gameClient.getPokedexByName(name));
  }

  getPokedexById(id: number): Observable<Pokedex> {
    return from(this.gameClient.getPokedexById(id));
  }

  getVersionByName(name: string): Observable<Version> {
    return from(this.gameClient.getVersionByName(name));
  }

  getVersionById(id: number): Observable<Version> {
    return from(this.gameClient.getVersionById(id));
  }

  getVersionGroupByName(name: string): Observable<VersionGroup> {
    return from(this.gameClient.getVersionGroupByName(name));
  }

  getVersionGroupById(id: number): Observable<VersionGroup> {
    return from(this.gameClient.getVersionGroupById(id));
  }

  listPokedexes(): Observable<NamedAPIResourceList> {
    return from(this.gameClient.listPokedexes(0, 1000));
  }

  listVersions(): Observable<NamedAPIResourceList> {
    return from(this.gameClient.listVersions());
  }

  listVersionGroups(): Observable<NamedAPIResourceList> {
    return from(this.gameClient.listVersionGroups());
  }
}
