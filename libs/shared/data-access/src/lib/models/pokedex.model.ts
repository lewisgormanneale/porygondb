import { Pokedex } from 'pokenode-ts';

export interface PokedexResult {
  id: number;
  pokedex: Pokedex;
}

// type PokedexState = {
//   pokedexes: Pokedex[];
//   isLoading: boolean;
//   _selectedPokedexId: number | null;
//   _selectedPokedexName: string | null;
//   pageSize: number;
//   pageIndex: number;
// };

// const initialState: PokedexState = {
//   pokedexes: [],
//   isLoading: false,
//   _selectedPokedexId: null,
//   _selectedPokedexName: null,
//   pageSize: 25,
//   pageIndex: 0,
// };
