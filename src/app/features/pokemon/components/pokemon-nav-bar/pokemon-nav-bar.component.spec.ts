import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PokemonNavBarComponent } from './pokemon-nav-bar.component';
import type { PokemonEntry } from '../../../../shared/interfaces/pokeapi';

describe('PokemonNavBarComponent', () => {
  let fixture: ComponentFixture<PokemonNavBarComponent>;
  let component: PokemonNavBarComponent;

  const entries: PokemonEntry[] = [
    {
      entry_number: 1,
      pokemon_species: {
        name: 'bulbasaur',
        url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
      },
    },
    {
      entry_number: 2,
      pokemon_species: {
        name: 'ivysaur',
        url: 'https://pokeapi.co/api/v2/pokemon-species/2/',
      },
    },
    {
      entry_number: 3,
      pokemon_species: {
        name: 'venusaur',
        url: 'https://pokeapi.co/api/v2/pokemon-species/3/',
      },
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonNavBarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonNavBarComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.componentRef.setInput('currentPokemonName', 'bulbasaur');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('computes previous and next entries around current pokemon', () => {
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.componentRef.setInput('currentPokemonName', 'ivysaur');
    fixture.componentRef.setInput('pokedexEntries', entries);
    fixture.detectChanges();

    const navigation = component.navigation();
    expect(navigation.currentIndex).toBe(1);
    expect(navigation.total).toBe(3);
    expect(navigation.prev?.pokemon_species.name).toBe('bulbasaur');
    expect(navigation.next?.pokemon_species.name).toBe('venusaur');
  });

  it('returns null previous entry when current pokemon is first', () => {
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.componentRef.setInput('currentPokemonName', 'bulbasaur');
    fixture.componentRef.setInput('pokedexEntries', entries);
    fixture.detectChanges();

    const navigation = component.navigation();
    expect(navigation.currentIndex).toBe(0);
    expect(navigation.prev).toBeNull();
    expect(navigation.next?.pokemon_species.name).toBe('ivysaur');
  });

  it('builds sprite url from species url id', () => {
    expect(component.getSpriteUrl('https://pokeapi.co/api/v2/pokemon-species/25/')).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    );
  });
});
