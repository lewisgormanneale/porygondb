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
    game_indices: [
      { game_index: 45, generation: { name: 'generation-iv', url: 'https://pokeapi.co/api/v2/generation/4/' } },
      { game_index: 45, generation: { name: 'generation-v', url: 'https://pokeapi.co/api/v2/generation/5/' } },
    ],
    prices: [
      {
        purchase_price: 4800,
        sell_price: 2400,
        currency: { name: 'poke-dollar', url: 'https://pokeapi.co/api/v2/currency/1/' },
        version_group: { name: 'sword-shield', url: 'https://pokeapi.co/api/v2/version-group/20/' },
      },
      {
        purchase_price: null,
        sell_price: 2400,
        currency: { name: 'poke-dollar', url: 'https://pokeapi.co/api/v2/currency/1/' },
        version_group: { name: 'scarlet-violet', url: 'https://pokeapi.co/api/v2/version-group/25/' },
      },
    ],
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
    expect(fixture.componentInstance.priceEntries()).toEqual([
      { versionGroupDisplayName: 'Sword Shield', purchasePriceLabel: '₽4,800', sellPriceLabel: '₽2,400' },
      { versionGroupDisplayName: 'Scarlet Violet', purchasePriceLabel: '—', sellPriceLabel: '₽2,400' },
    ]);
    expect(fixture.componentInstance.generationLabels()).toEqual(['Generation IV', 'Generation V']);
    expect(fixture.componentInstance.englishShortEffect()).toBe(
      'Raises a Pokémon’s level by one.'
    );
    expect(fixture.componentInstance.attributeLabels()).toEqual(['Holdable']);
    expect(fixture.componentInstance.heldByPokemon().map((entry) => entry.pokemon.name)).toEqual([
      'blissey',
      'charizard-mega-x',
    ]);
  });

  it('shows no price data and fling power when present', () => {
    getItemByNameMock.mockReturnValue(
      of(createItemMock({ prices: [], fling_power: 30, fling_effect: null }))
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

    expect(fixture.componentInstance.priceEntries()).toEqual([]);
    expect(fixture.componentInstance.flingPowerLabel()).toBe('30');
  });

  it('does not crash when the item has no baby-trigger, machine or prices data', () => {
    getItemByNameMock.mockReturnValue(
      of(createItemMock({ prices: [], machines: [], baby_trigger_for: null, game_indices: [] }))
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

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.componentInstance.hasBabyTrigger()).toBe(false);
    expect(fixture.componentInstance.machineVersionGroupLabels()).toEqual([]);
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
