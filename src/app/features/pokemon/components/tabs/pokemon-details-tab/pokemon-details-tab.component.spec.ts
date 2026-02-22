import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import type { DeepSignal } from '@ngrx/signals';
import { PokemonDetailsTabComponent } from './pokemon-details-tab.component';
import { PokemonService } from '../../../../../shared/services/pokemon.service';
import { PokemonStore } from '../../../../../shared/+state/pokemon.store';
import type { Pokemon, PokemonSpecies } from 'pokenode-ts';

describe('PokemonDetailsTabComponent', () => {
  const pokemonStoreStub: Partial<PokemonStore> = {
    selectedEntity: signal<Pokemon | null>(null),
    speciesDetails: signal<PokemonSpecies>({} as PokemonSpecies) as unknown as DeepSignal<PokemonSpecies>,
    setSelectedId: jest.fn(),
  };
  const pokemonServiceStub: Partial<PokemonService> = {
    getAbilityByName: jest.fn(),
  };

  it('should create component', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [PokemonDetailsTabComponent],
      providers: [
        { provide: PokemonStore, useValue: pokemonStoreStub },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(PokemonDetailsTabComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
