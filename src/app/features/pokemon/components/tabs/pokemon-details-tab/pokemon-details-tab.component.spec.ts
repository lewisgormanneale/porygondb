import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import type { DeepSignal } from '@ngrx/signals';
import { PokemonDetailsTabComponent } from './pokemon-details-tab.component';
import { PokemonService } from '../../../../../shared/services/pokemon.service';
import { PokemonStore } from '../../../../../shared/+state/pokemon.store';
import type { Pokemon, PokemonSpecies } from '../../../../../shared/interfaces/pokeapi';

describe('PokemonDetailsTabComponent', () => {
  const selectedEntitySignal = signal<Pokemon | null>(null);
  const englishSpeciesDescriptionSignal = signal<any>(null);
  const getAbilityByNameMock = vi.fn();
  const pokemonStoreStub: Partial<PokemonStore> = {
    selectedEntity: selectedEntitySignal,
    speciesDetails: signal<PokemonSpecies>(
      {} as PokemonSpecies
    ) as unknown as DeepSignal<PokemonSpecies>,
    englishSpeciesDescription: englishSpeciesDescriptionSignal as any,
    setSelectedId: vi.fn(),
  };
  const pokemonServiceStub: Partial<PokemonService> = {
    getAbilityByName: getAbilityByNameMock,
  };

  it('should create component', () => {
    selectedEntitySignal.set(null);
    englishSpeciesDescriptionSignal.set(null);

    getAbilityByNameMock.mockReturnValue(
      of({ names: [{ language: { name: 'en' }, name: 'Overgrow' }] })
    );

    const fixture = TestBed.configureTestingModule({
      imports: [PokemonDetailsTabComponent],
      providers: [
        { provide: PokemonStore, useValue: pokemonStoreStub },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(PokemonDetailsTabComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads and sorts abilities by slot', () => {
    selectedEntitySignal.set(null);
    englishSpeciesDescriptionSignal.set(null);

    getAbilityByNameMock.mockImplementation((abilityName: string) => {
      if (abilityName === 'chlorophyll') {
        return of({ names: [{ language: { name: 'en' }, name: 'Chlorophyll' }] });
      }

      return of({ names: [{ language: { name: 'en' }, name: 'Overgrow' }] });
    });

    const fixture = TestBed.configureTestingModule({
      imports: [PokemonDetailsTabComponent],
      providers: [
        { provide: PokemonStore, useValue: pokemonStoreStub },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(PokemonDetailsTabComponent);

    selectedEntitySignal.set({
      abilities: [
        {
          ability: { name: 'chlorophyll' },
          slot: 3,
          is_hidden: true,
        },
        {
          ability: { name: 'overgrow' },
          slot: 1,
          is_hidden: false,
        },
      ],
    } as unknown as Pokemon);

    fixture.detectChanges();

    const abilities = fixture.componentInstance.abilities();
    expect(abilities).toHaveLength(2);
    expect(abilities.map((ability) => ability.slot)).toEqual([1, 3]);
    expect(abilities[0].isHidden).toBe(false);
    expect(abilities[1].isHidden).toBe(true);
  });

  it('clears abilities when selected entity has no abilities', () => {
    selectedEntitySignal.set(null);
    englishSpeciesDescriptionSignal.set(null);

    getAbilityByNameMock.mockReturnValue(of({ names: [] }));

    const fixture = TestBed.configureTestingModule({
      imports: [PokemonDetailsTabComponent],
      providers: [
        { provide: PokemonStore, useValue: pokemonStoreStub },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(PokemonDetailsTabComponent);

    selectedEntitySignal.set({
      abilities: [
        {
          ability: { name: 'overgrow' },
          slot: 1,
          is_hidden: false,
        },
      ],
    } as unknown as Pokemon);
    fixture.detectChanges();
    expect(fixture.componentInstance.abilities().length).toBe(1);

    selectedEntitySignal.set({ abilities: [] } as unknown as Pokemon);
    fixture.detectChanges();
    expect(fixture.componentInstance.abilities()).toEqual([]);
  });
});
