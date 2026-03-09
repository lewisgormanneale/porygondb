import { convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Ability } from '../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { createPokemonMock } from '../../../../../testing/mocks/pokemon.mock';
import { AbilityComponent } from './ability.component';

function createAbilityMock(): Ability {
  return {
    id: 34,
    name: 'chlorophyll',
    is_main_series: true,
    generation: { name: 'generation-iii', url: 'https://pokeapi.co/api/v2/generation/3/' },
    names: [
      {
        name: 'Chlorophyll',
        language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
      },
    ],
    effect_entries: [
      {
        effect: 'Boosts the Pokémon’s Speed in sunshine.',
        short_effect: 'Boosts Speed in sunshine.',
        language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
      },
    ],
    effect_changes: [],
    flavor_text_entries: [],
    pokemon: [
      {
        is_hidden: false,
        slot: 1,
        pokemon: { name: 'charizard-mega-x', url: 'https://pokeapi.co/api/v2/pokemon/10034/' },
      },
      {
        is_hidden: false,
        slot: 1,
        pokemon: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      },
      {
        is_hidden: true,
        slot: 3,
        pokemon: { name: 'oddish', url: 'https://pokeapi.co/api/v2/pokemon/43/' },
      },
    ],
  };
}

describe('AbilityComponent', () => {
  const paramMapSubject = new BehaviorSubject(convertToParamMap({ name: 'chlorophyll' }));
  const getAbilityByNameMock = vi.fn();
  const getPokemonByNameMock = vi.fn();

  const pokemonServiceStub = {
    getAbilityByName: getAbilityByNameMock,
    getPokemonByName: getPokemonByNameMock,
  };

  it('loads ability details and separates standard/hidden pokemon groups', () => {
    getAbilityByNameMock.mockReturnValue(of(createAbilityMock()));
    getPokemonByNameMock.mockReset();

    const fixture = TestBed.configureTestingModule({
      imports: [AbilityComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(AbilityComponent);

    fixture.detectChanges();

    expect(getAbilityByNameMock).toHaveBeenCalledWith('chlorophyll');
    expect(fixture.componentInstance.displayName()).toBe('Chlorophyll');
    expect(
      fixture.componentInstance.normalAbilityPokemon().map((entry) => entry.pokemon.name)
    ).toEqual(['bulbasaur', 'charizard-mega-x']);
    expect(
      fixture.componentInstance.hiddenAbilityPokemon().map((entry) => entry.pokemon.name)
    ).toEqual(['oddish']);
  });

  it('navigates to species route for form pokemon names on click', () => {
    getAbilityByNameMock.mockReturnValue(of(createAbilityMock()));
    getPokemonByNameMock.mockReturnValue(
      of(
        createPokemonMock({
          name: 'charizard-mega-x',
          species: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-species/6/' },
        })
      )
    );

    const fixture = TestBed.configureTestingModule({
      imports: [AbilityComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(AbilityComponent);

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    fixture.componentInstance.onAbilityPokemonClick(new MouseEvent('click'), 'charizard-mega-x');

    expect(getPokemonByNameMock).toHaveBeenCalledWith('charizard-mega-x');
    expect(navigateSpy).toHaveBeenCalledWith(['/pokedex', 'national', 'national', 'charizard']);
  });

  it('navigates to species route when clicking rendered pokemon sprite link', () => {
    getAbilityByNameMock.mockReturnValue(of(createAbilityMock()));
    getPokemonByNameMock.mockReturnValue(
      of(
        createPokemonMock({
          name: 'charizard-mega-x',
          species: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-species/6/' },
        })
      )
    );

    const fixture = TestBed.configureTestingModule({
      imports: [AbilityComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(AbilityComponent);

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    const hostElement: HTMLElement = fixture.nativeElement;
    const megaSpriteLink = hostElement.querySelector('a[title="charizard-mega-x"]');
    expect(megaSpriteLink).not.toBeNull();

    megaSpriteLink?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(getPokemonByNameMock).toHaveBeenCalledWith('charizard-mega-x');
    expect(navigateSpy).toHaveBeenCalledWith(['/pokedex', 'national', 'national', 'charizard']);
  });

  it('uses pokemon name fallback if species lookup request fails', () => {
    getAbilityByNameMock.mockReturnValue(of(createAbilityMock()));
    getPokemonByNameMock.mockReturnValue(throwError(() => new Error('network fail')));

    const fixture = TestBed.configureTestingModule({
      imports: [AbilityComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(AbilityComponent);

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    fixture.componentInstance.onAbilityPokemonClick(new MouseEvent('click'), 'deoxys-attack');

    expect(navigateSpy).toHaveBeenCalledWith(['/pokedex', 'national', 'national', 'deoxys-attack']);
  });

  it('reuses cached species mappings to avoid refetching', () => {
    getAbilityByNameMock.mockReturnValue(of(createAbilityMock()));
    getPokemonByNameMock.mockReset();

    const fixture = TestBed.configureTestingModule({
      imports: [AbilityComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(AbilityComponent);

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    fixture.componentInstance.speciesNameByPokemonName.set({ 'charizard-mega-x': 'charizard' });

    fixture.componentInstance.onAbilityPokemonClick(new MouseEvent('click'), 'charizard-mega-x');

    expect(getPokemonByNameMock).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/pokedex', 'national', 'national', 'charizard']);
  });
});
