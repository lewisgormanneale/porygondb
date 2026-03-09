import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { PokemonSummaryComponent } from './pokemon-summary.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';

describe('PokemonSummaryComponent', () => {
  let fixture: ComponentFixture<PokemonSummaryComponent>;
  let component: PokemonSummaryComponent;

  const setSelectedIdMock = vi.fn();
  const selectedEntitySignal = signal<any>({
    name: 'bulbasaur',
    sprites: {
      front_default: 'https://img.test/front.png',
    },
  });
  const speciesDetailsSignal = signal<any>({
    name: 'bulbasaur',
    names: [{ language: { name: 'en' }, name: 'Bulbasaur' }],
    genera: [{ language: { name: 'en' }, genus: 'Seed Pokémon' }],
  });
  const selectedPokemonHomeFrontSpriteSignal = signal<string>('https://img.test/home.png');
  const selectedPokemonDisplayNameSignal = signal<string>('bulbasaur');
  const entitiesSignal = signal<any[]>([
    {
      id: 1,
      name: 'bulbasaur',
      sprites: { front_default: 'https://img.test/form1.png' },
    },
    {
      id: 10001,
      name: 'bulbasaur-mega',
      sprites: { front_default: 'https://img.test/form2.png' },
    },
  ]);

  const pokemonStoreStub = {
    selectedEntity: selectedEntitySignal,
    speciesDetails: speciesDetailsSignal,
    selectedPokemonHomeFrontSprite: selectedPokemonHomeFrontSpriteSignal,
    selectedPokemonDisplayName: selectedPokemonDisplayNameSignal,
    entities: entitiesSignal,
    setSelectedPokemonVariety: setSelectedIdMock,
    setSelectedId: setSelectedIdMock,
  };

  beforeEach(async () => {
    setSelectedIdMock.mockClear();

    await TestBed.configureTestingModule({
      imports: [PokemonSummaryComponent],
      providers: [{ provide: PokemonStore, useValue: pokemonStoreStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonSummaryComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('calls store setSelectedId when selecting a variety', () => {
    fixture.detectChanges();

    component.setSelectedPokemonVariety(10001);

    expect(setSelectedIdMock).toHaveBeenCalledWith(10001);
  });

  it('renders form options when multiple forms exist', () => {
    fixture.detectChanges();

    const formOptions = fixture.nativeElement.querySelectorAll('.form-option');
    expect(formOptions.length).toBe(2);
  });

  it('updates displayed name when selected form changes', () => {
    fixture.detectChanges();

    selectedPokemonDisplayNameSignal.set('mega form');
    selectedEntitySignal.set({
      name: 'bulbasaur-mega',
      sprites: { front_default: 'https://img.test/form2.png' },
    });
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('mat-card-title');
    expect(title?.textContent?.trim()).toBe('mega form');
  });

  it('shows skeleton title while form name is loading', () => {
    selectedPokemonDisplayNameSignal.set('');
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('.skeleton-name');
    expect(skeleton).toBeTruthy();
  });

  it('adds active class to selected form', () => {
    fixture.detectChanges();

    selectedEntitySignal.set({
      id: 10001,
      name: 'bulbasaur-mega',
      sprites: { front_default: 'https://img.test/form2.png' },
    });
    fixture.detectChanges();

    const activeOption = fixture.nativeElement.querySelector('.form-option-active');
    expect(activeOption).toBeTruthy();
  });

  it('hides form options when only one form exists', () => {
    entitiesSignal.set([
      {
        id: 1,
        name: 'bulbasaur',
        sprites: { front_default: 'https://img.test/form1.png' },
      },
    ]);

    fixture.detectChanges();

    const formOptions = fixture.nativeElement.querySelectorAll('.form-option');
    expect(formOptions.length).toBe(0);
  });
});
