import { Routes } from '@angular/router';
import { PokedexComponent } from './features/pokedex/pages/pokedex/pokedex.component';
import { PokemonComponent } from './features/pokemon/pages/pokemon/pokemon.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/pokedex/national/national', pathMatch: 'full' },
  {
    path: 'abilities',
    loadComponent: () =>
      import('./features/abilities/pages/abilities/abilities.component').then(
        (m) => m.AbilitiesComponent
      ),
  },
  {
    path: 'abilities/:name',
    loadComponent: () =>
      import('./features/abilities/pages/ability/ability.component').then(
        (m) => m.AbilityComponent
      ),
  },
  {
    path: 'items',
    loadComponent: () =>
      import('./features/items/pages/items/items.component').then((m) => m.ItemsComponent),
  },
  {
    path: 'items/:name',
    loadComponent: () =>
      import('./features/items/pages/item/item.component').then((m) => m.ItemComponent),
  },
  {
    path: 'moves',
    loadComponent: () =>
      import('./features/moves/pages/moves/moves.component').then((m) => m.MovesComponent),
  },
  {
    path: 'moves/:name',
    loadComponent: () =>
      import('./features/moves/pages/move/move.component').then((m) => m.MoveComponent),
  },
  { path: 'pokedex/:versionGroupName/:pokedexName', component: PokedexComponent },
  { path: 'pokedex/:versionGroupName/:pokedexName/:name', component: PokemonComponent },
  { path: '**', component: PageNotFoundComponent },
];
