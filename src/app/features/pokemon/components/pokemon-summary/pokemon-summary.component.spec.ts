import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PokemonSummaryComponent } from './pokemon-summary.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';

describe('PokemonSummaryComponent', () => {
  let fixture: ComponentFixture<PokemonSummaryComponent>;
  let component: PokemonSummaryComponent;

  const setSelectedIdMock = jest.fn();
  const selectedEntitySignal = signal<any>({
    sprites: {
      front_default: 'https://img.test/front.png',
    },
  });
  const speciesDetailsSignal = signal<any>({
    names: [{ language: { name: 'en' }, name: 'Bulbasaur' }],
    genera: [{ language: { name: 'en' }, genus: 'Seed Pokémon' }],
  });
  const selectedPokemonHomeFrontSpriteSignal = signal<string>('https://img.test/home.png');
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
    entities: entitiesSignal,
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
