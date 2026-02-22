import { Routes } from '@angular/router';
import { PokedexComponent } from './features/pokedex/pages/pokedex/pokedex.component';
import { PokemonComponent } from './features/pokemon/pages/pokemon/pokemon.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/pokedex/red-blue', pathMatch: 'full' },
  { path: 'pokedex/:versionGroupName', component: PokedexComponent },
  { path: 'pokemon/:name', component: PokemonComponent },
  { path: '**', component: PageNotFoundComponent },
];
