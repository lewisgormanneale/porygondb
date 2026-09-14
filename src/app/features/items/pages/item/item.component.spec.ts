import { convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Item } from '../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { createPokemonMock } from '../../../../../testing/mocks/pokemon.mock';
import { ItemComponent } from './item.component';

function createItemMock(overrides: Partial<Item> = {}): Item {
  return {
    id: 50,
    name: 'rare-candy',
    cost: 4800,
    fling_power: null,
    fling_effect: null,
    attributes: [{ name: 'holdable', url: 'https://pokeapi.co/api/v2/item-attribute/5/' }],
    category: { name: 'vitamins', url: 'https://pokeapi.co/api/v2/item-category/7/' },
    effect_entries: [
      {
        effect: 'Raises the level of the target Pokémon by one.',
        short_effect: 'Raises a Pokémon’s level by one.',
        language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
      },
    ],
    flavor_text_entries: [
      {
        text: 'A candy that is packed with energy. It raises the level of a Pokémon by one.',
        language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
        version_group: { name: 'sword-shield', url: 'https://pokeapi.co/api/v2/version-group/20/' },
      },
    ],
    game_indices: [],
    names: [
      {
        name: 'Rare Candy',
        language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
      },
    ],
    sprites: {
      default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png',
    },
    held_by_pokemon: [
      { pokemon: { name: 'charizard-mega-x', url: 'https://pokeapi.co/api/v2/pokemon/10034/' }, version_details: [] },
      { pokemon: { name: 'blissey', url: 'https://pokeapi.co/api/v2/pokemon/242/' }, version_details: [] },
    ],
    baby_trigger_for: null,
    machines: [],
    ...overrides,
  };
}

describe('ItemComponent', () => {
  const paramMapSubject = new BehaviorSubject(convertToParamMap({ name: 'rare-candy' }));
  const getItemByNameMock = vi.fn();
  const getPokemonByNameMock = vi.fn();

  const pokemonServiceStub = {
    getItemByName: getItemByNameMock,
    getPokemonByName: getPokemonByNameMock,
  };

  it('loads item details and derives display fields', () => {
    getItemByNameMock.mockReturnValue(of(createItemMock()));
    getPokemonByNameMock.mockReset();

    const fixture = TestBed.configureTestingModule({
      imports: [ItemComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(ItemComponent);

    fixture.detectChanges();

    expect(getItemByNameMock).toHaveBeenCalledWith('rare-candy');
    expect(fixture.componentInstance.displayName()).toBe('Rare Candy');
    expect(fixture.componentInstance.categoryLabel()).toBe('Vitamins');
    expect(fixture.componentInstance.costLabel()).toBe('₽4,800');
    expect(fixture.componentInstance.englishShortEffect()).toBe(
      'Raises a Pokémon’s level by one.'
    );
    expect(fixture.componentInstance.attributeLabels()).toEqual(['Holdable']);
    expect(fixture.componentInstance.heldByPokemon().map((entry) => entry.pokemon.name)).toEqual([
      'blissey',
      'charizard-mega-x',
    ]);
  });

  it('shows a not-sold cost label and fling power when present', () => {
    getItemByNameMock.mockReturnValue(
      of(createItemMock({ cost: 0, fling_power: 30, fling_effect: null }))
    );

    const fixture = TestBed.configureTestingModule({
      imports: [ItemComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(ItemComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.costLabel()).toBe('Not sold in shops');
    expect(fixture.componentInstance.flingPowerLabel()).toBe('30');
  });

  it('navigates to species route when clicking rendered pokemon sprite link', () => {
    getItemByNameMock.mockReturnValue(of(createItemMock()));
    getPokemonByNameMock.mockReturnValue(
      of(
        createPokemonMock({
          name: 'charizard-mega-x',
          species: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-species/6/' },
        })
      )
    );

    const fixture = TestBed.configureTestingModule({
      imports: [ItemComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(ItemComponent);

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
    getItemByNameMock.mockReturnValue(of(createItemMock()));
    getPokemonByNameMock.mockReturnValue(throwError(() => new Error('network fail')));

    const fixture = TestBed.configureTestingModule({
      imports: [ItemComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(ItemComponent);

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    fixture.componentInstance.onHolderPokemonClick(new MouseEvent('click'), 'deoxys-attack');

    expect(navigateSpy).toHaveBeenCalledWith(['/pokedex', 'national', 'national', 'deoxys-attack']);
  });
});
