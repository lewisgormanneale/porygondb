import { convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { Move } from '../../../../shared/interfaces/pokeapi';
import { PokemonService } from '../../../../shared/services/pokemon.service';
import { ThemeStore } from '../../../../core/+state/theme.store';
import { createPokemonMock } from '../../../../../testing/mocks/pokemon.mock';
import { MoveComponent } from './move.component';

function createMoveMock(overrides: Partial<Move> = {}): Move {
  return {
    id: 85,
    name: 'thunderbolt',
    accuracy: 100,
    effect_chance: 10,
    pp: 15,
    priority: 0,
    power: 90,
    contest_type: null,
    contest_effect: null,
    super_contest_effect: null,
    damage_class: { name: 'special', url: 'https://pokeapi.co/api/v2/move-damage-class/3/' },
    effect_entries: [
      {
        effect: 'Has a $effect_chance% chance to paralyze the target.',
        short_effect: 'Has a $effect_chance% chance to paralyze the target.',
        language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
      },
    ],
    effect_changes: [],
    learned_by_pokemon: [
      { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
      { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' },
    ],
    flavor_text_entries: [
      {
        flavor_text: 'A strong electric blast is loosed at the target.',
        language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
        version_group: { name: 'sword-shield', url: 'https://pokeapi.co/api/v2/version-group/20/' },
      },
    ],
    generation: { name: 'generation-i', url: 'https://pokeapi.co/api/v2/generation/1/' },
    machines: [],
    meta: {
      ailment: { name: 'paralysis', url: 'https://pokeapi.co/api/v2/move-ailment/7/' },
      category: { name: 'damage+ailment', url: 'https://pokeapi.co/api/v2/move-category/4/' },
      min_hits: null,
      max_hits: null,
      min_turns: null,
      max_turns: null,
      drain: 0,
      healing: 0,
      crit_rate: 0,
      ailment_chance: 10,
      flinch_chance: 0,
      stat_chance: 0,
    },
    names: [
      {
        name: 'Thunderbolt',
        language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
      },
    ],
    stat_changes: [],
    target: { name: 'selected-pokemon', url: 'https://pokeapi.co/api/v2/move-target/10/' },
    type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' },
    ...overrides,
  };
}

describe('MoveComponent', () => {
  const paramMapSubject = new BehaviorSubject(convertToParamMap({ name: 'thunderbolt' }));
  const getMoveByNameMock = vi.fn();
  const getPokemonByNameMock = vi.fn();

  const pokemonServiceStub = {
    getMoveByName: getMoveByNameMock,
    getPokemonByName: getPokemonByNameMock,
  };

  const themeStoreStub = {
    isDarkTheme: () => false,
  };

  it('loads move details and derives display fields', () => {
    getMoveByNameMock.mockReturnValue(of(createMoveMock()));
    getPokemonByNameMock.mockReset();

    const fixture = TestBed.configureTestingModule({
      imports: [MoveComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
        { provide: ThemeStore, useValue: themeStoreStub },
      ],
    }).createComponent(MoveComponent);

    fixture.detectChanges();

    expect(getMoveByNameMock).toHaveBeenCalledWith('thunderbolt');
    expect(fixture.componentInstance.displayName()).toBe('Thunderbolt');
    expect(fixture.componentInstance.generationLabel()).toBe('Generation I');
    expect(fixture.componentInstance.damageClassDisplayName()).toBe('Special');
    expect(fixture.componentInstance.targetLabel()).toBe('Selected Pokemon');
    expect(fixture.componentInstance.englishShortEffect()).toBe(
      'Has a 10% chance to paralyze the target.'
    );
    expect(fixture.componentInstance.englishDetailedEffect()).toBe('');
    expect(fixture.componentInstance.metaRows()).toEqual(
      expect.arrayContaining([{ label: 'Ailment', value: 'Paralysis (10%)' }])
    );
    expect(fixture.componentInstance.learnedByPokemon().map((entry) => entry.name)).toEqual([
      'pikachu',
      'raichu',
    ]);
  });

  it('hides the detailed effect when it duplicates the short effect', () => {
    getMoveByNameMock.mockReturnValue(
      of(
        createMoveMock({
          effect_entries: [
            {
              effect: 'Has a $effect_chance% chance to paralyze the target.',
              short_effect: 'Has a $effect_chance% chance to paralyze the target.',
              language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
            },
          ],
        })
      )
    );

    const fixture = TestBed.configureTestingModule({
      imports: [MoveComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
        { provide: ThemeStore, useValue: themeStoreStub },
      ],
    }).createComponent(MoveComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.englishDetailedEffect()).toBe('');
    expect(fixture.componentInstance.hasNoEffectInfo()).toBe(false);
  });

  it('formats positive and negative stat changes', () => {
    getMoveByNameMock.mockReturnValue(
      of(
        createMoveMock({
          stat_changes: [
            { change: 2, stat: { name: 'attack', url: 'https://pokeapi.co/api/v2/stat/1/' } },
            { change: -1, stat: { name: 'defense', url: 'https://pokeapi.co/api/v2/stat/2/' } },
          ],
        })
      )
    );

    const fixture = TestBed.configureTestingModule({
      imports: [MoveComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
        { provide: ThemeStore, useValue: themeStoreStub },
      ],
    }).createComponent(MoveComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance.statChangeLabels()).toEqual([
      { label: '+2 Attack', isPositive: true },
      { label: '-1 Defense', isPositive: false },
    ]);
  });

  it('navigates to species route when clicking rendered pokemon sprite link', () => {
    getMoveByNameMock.mockReturnValue(of(createMoveMock()));
    getPokemonByNameMock.mockReturnValue(
      of(
        createPokemonMock({
          name: 'raichu',
          species: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon-species/26/' },
        })
      )
    );

    const fixture = TestBed.configureTestingModule({
      imports: [MoveComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
        { provide: ThemeStore, useValue: themeStoreStub },
      ],
    }).createComponent(MoveComponent);

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    const hostElement: HTMLElement = fixture.nativeElement;
    const raichuLink = hostElement.querySelector('a[title="raichu"]');
    expect(raichuLink).not.toBeNull();

    raichuLink?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(getPokemonByNameMock).toHaveBeenCalledWith('raichu');
    expect(navigateSpy).toHaveBeenCalledWith(['/pokedex', 'national', 'national', 'raichu']);
  });

  it('uses pokemon name fallback if species lookup request fails', () => {
    getMoveByNameMock.mockReturnValue(of(createMoveMock()));
    getPokemonByNameMock.mockReturnValue(throwError(() => new Error('network fail')));

    const fixture = TestBed.configureTestingModule({
      imports: [MoveComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: PokemonService, useValue: pokemonServiceStub },
        { provide: ThemeStore, useValue: themeStoreStub },
      ],
    }).createComponent(MoveComponent);

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();

    fixture.componentInstance.onLearnedByPokemonClick(new MouseEvent('click'), 'deoxys-attack');

    expect(navigateSpy).toHaveBeenCalledWith(['/pokedex', 'national', 'national', 'deoxys-attack']);
  });
});
