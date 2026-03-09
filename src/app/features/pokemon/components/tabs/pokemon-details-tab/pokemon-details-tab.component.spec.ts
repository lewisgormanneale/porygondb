import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { PokemonDetailsTabComponent } from './pokemon-details-tab.component';
import { PokemonService } from '../../../../../shared/services/pokemon.service';
import { PokemonStore } from '../../../../../shared/+state/pokemon.store';
import type { FlavorText, Pokemon, PokemonSpecies } from '../../../../../shared/interfaces/pokeapi';
import {
  createPokemonMock,
  createPokemonSpeciesMock,
} from '../../../../../../testing/mocks/pokemon.mock';

describe('PokemonDetailsTabComponent', () => {
  const selectedEntitySignal = signal<Pokemon | null>(null);
  const englishSpeciesDescriptionSignal = signal<FlavorText | undefined>(undefined);
  const speciesDetailsSignal = signal<PokemonSpecies>(createPokemonSpeciesMock());
  const getAbilityByNameMock = vi.fn();
  const pokemonStoreStub = {
    selectedEntity: selectedEntitySignal,
    speciesDetails: speciesDetailsSignal,
    englishSpeciesDescription: englishSpeciesDescriptionSignal,
    setSelectedId: vi.fn(),
  };

  const pokemonServiceStub = {
    getAbilityByName: getAbilityByNameMock,
  };

  it('should create component', () => {
    selectedEntitySignal.set(null);
    englishSpeciesDescriptionSignal.set(undefined);

    getAbilityByNameMock.mockReturnValue(
      of({ names: [{ language: { name: 'en' }, name: 'Overgrow' }] })
    );

    const fixture = TestBed.configureTestingModule({
      imports: [PokemonDetailsTabComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonStore, useValue: pokemonStoreStub },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(PokemonDetailsTabComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads and sorts abilities by slot', () => {
    selectedEntitySignal.set(null);
    englishSpeciesDescriptionSignal.set(undefined);

    getAbilityByNameMock.mockImplementation((abilityName: string) => {
      if (abilityName === 'chlorophyll') {
        return of({
          names: [{ language: { name: 'en' }, name: 'Chlorophyll' }],
          effect_entries: [
            {
              language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
              short_effect: 'Boosts Speed in sunshine.',
              effect: 'Boosts Speed in sunshine.',
            },
          ],
        });
      }

      return of({
        names: [{ language: { name: 'en' }, name: 'Overgrow' }],
        effect_entries: [
          {
            language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
            short_effect: 'Boosts grass moves in a pinch.',
            effect: 'Boosts grass moves in a pinch.',
          },
        ],
      });
    });

    const fixture = TestBed.configureTestingModule({
      imports: [PokemonDetailsTabComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonStore, useValue: pokemonStoreStub },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(PokemonDetailsTabComponent);

    selectedEntitySignal.set(
      createPokemonMock({
        abilities: [
          {
            ability: { name: 'chlorophyll', url: 'https://pokeapi.co/api/v2/ability/34/' },
            slot: 3,
            is_hidden: true,
          },
          {
            ability: { name: 'overgrow', url: 'https://pokeapi.co/api/v2/ability/65/' },
            slot: 1,
            is_hidden: false,
          },
        ],
      })
    );

    fixture.detectChanges();

    const abilities = fixture.componentInstance.abilities();
    expect(abilities).toHaveLength(2);
    expect(abilities.map((ability) => ability.slot)).toEqual([1, 3]);
    expect(abilities[0].isHidden).toBe(false);
    expect(abilities[1].isHidden).toBe(true);
  });

  it('clears abilities when selected entity has no abilities', () => {
    selectedEntitySignal.set(null);
    englishSpeciesDescriptionSignal.set(undefined);

    getAbilityByNameMock.mockReturnValue(
      of({
        names: [],
        effect_entries: [],
      })
    );

    const fixture = TestBed.configureTestingModule({
      imports: [PokemonDetailsTabComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonStore, useValue: pokemonStoreStub },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(PokemonDetailsTabComponent);

    selectedEntitySignal.set(
      createPokemonMock({
        abilities: [
          {
            ability: { name: 'overgrow', url: 'https://pokeapi.co/api/v2/ability/65/' },
            slot: 1,
            is_hidden: false,
          },
        ],
      })
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.abilities().length).toBe(1);

    selectedEntitySignal.set(createPokemonMock({ abilities: [] }));
    fixture.detectChanges();
    expect(fixture.componentInstance.abilities()).toEqual([]);
  });

  it('renders ability chip as a link to the ability page', () => {
    selectedEntitySignal.set(null);
    englishSpeciesDescriptionSignal.set(undefined);

    getAbilityByNameMock.mockReturnValue(
      of({
        names: [{ language: { name: 'en' }, name: 'Overgrow' }],
        effect_entries: [
          {
            language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
            short_effect: 'Boosts grass moves in a pinch.',
            effect: 'Boosts grass moves in a pinch.',
          },
        ],
      })
    );

    const fixture = TestBed.configureTestingModule({
      imports: [PokemonDetailsTabComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonStore, useValue: pokemonStoreStub },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(PokemonDetailsTabComponent);

    selectedEntitySignal.set(
      createPokemonMock({
        abilities: [
          {
            ability: { name: 'overgrow', url: 'https://pokeapi.co/api/v2/ability/65/' },
            slot: 1,
            is_hidden: false,
          },
        ],
      })
    );
    fixture.detectChanges();

    const abilityLink: HTMLAnchorElement | null =
      fixture.nativeElement.querySelector('a[mat-chip]');
    expect(abilityLink).not.toBeNull();
    expect(abilityLink?.getAttribute('href')).toBe('/abilities/overgrow');
  });

  it('shows ability description on hover and hides on outside click', () => {
    selectedEntitySignal.set(null);
    englishSpeciesDescriptionSignal.set(undefined);

    getAbilityByNameMock.mockReturnValue(
      of({
        names: [{ language: { name: 'en' }, name: 'Overgrow' }],
        effect_entries: [
          {
            language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
            short_effect: 'Boosts grass moves in a pinch.',
            effect: 'Boosts grass moves in a pinch.',
          },
        ],
      })
    );

    const fixture = TestBed.configureTestingModule({
      imports: [PokemonDetailsTabComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: PokemonStore, useValue: pokemonStoreStub },
        { provide: PokemonService, useValue: pokemonServiceStub },
      ],
    }).createComponent(PokemonDetailsTabComponent);

    selectedEntitySignal.set(
      createPokemonMock({
        abilities: [
          {
            ability: { name: 'overgrow', url: 'https://pokeapi.co/api/v2/ability/65/' },
            slot: 1,
            is_hidden: false,
          },
        ],
      })
    );
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.ability-chip-wrapper');
    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();

    let popover = fixture.nativeElement.querySelector(
      '[data-testid="ability-description-popover"]'
    );
    expect(popover?.textContent).toContain('Boosts grass moves in a pinch.');

    document.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    popover = fixture.nativeElement.querySelector('[data-testid="ability-description-popover"]');
    expect(popover).toBeNull();
  });
});
