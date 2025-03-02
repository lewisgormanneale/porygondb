import { Injectable } from '@angular/core';
import { Move, MoveClient, NamedAPIResourceList } from 'pokenode-ts';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MoveService {
  private readonly moveClient: MoveClient;

  constructor() {
    this.moveClient = new MoveClient();
  }

  getMoveByName(name: string): Observable<Move> {
    return from(this.moveClient.getMoveByName(name));
  }

  getMoveById(id: number): Observable<Move> {
    return from(this.moveClient.getMoveById(id));
  }

  listMoves(offset?: number, limit?: number): Observable<NamedAPIResourceList> {
    return from(this.moveClient.listMoves(offset, limit));
  }
}
