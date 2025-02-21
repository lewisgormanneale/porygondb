import { Routes } from '@angular/router';
import { PokedexComponent } from './pages/pokedex/pokedex.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PokemonComponent } from './pages/pokemon/pokemon.component';

export const routes: Routes = [
  { path: '', component: PokedexComponent },
  { path: 'pokemon/:name', component: PokemonComponent },
  { path: '**', component: PageNotFoundComponent },
];
