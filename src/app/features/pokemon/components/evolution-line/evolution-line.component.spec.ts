import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { EvolutionLineComponent } from './evolution-line.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';

describe('EvolutionLineComponent', () => {
  let fixture: ComponentFixture<EvolutionLineComponent>;
  let component: EvolutionLineComponent;

  const evolutionLineSignal = signal<any[][]>([
    [{ speciesName: 'bulbasaur', speciesId: 1 }],
    [{ speciesName: 'ivysaur', speciesId: 2 }],
    [{ speciesName: 'venusaur', speciesId: 3 }],
  ]);

  const pokemonStoreStub = {
    evolutionLine: evolutionLineSignal,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvolutionLineComponent],
      providers: [provideRouter([]), { provide: PokemonStore, useValue: pokemonStoreStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(EvolutionLineComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('renders linked evolution entries when chain has multiple stages', () => {
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.detectChanges();

    const evolutionLinks = fixture.nativeElement.querySelectorAll('a.evolution-pokemon');
    expect(evolutionLinks.length).toBe(3);
  });

  it('shows no-evolution message when chain has one stage', () => {
    evolutionLineSignal.set([[{ speciesName: 'ditto', speciesId: 132 }]]);

    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.detectChanges();

    const noEvolutionMessage = fixture.nativeElement.querySelector('.no-evolution');
    expect(noEvolutionMessage?.textContent).toContain('does not evolve');
  });

  it('builds sprite url from species id', () => {
    expect(component.getSpriteUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    );
  });
});
