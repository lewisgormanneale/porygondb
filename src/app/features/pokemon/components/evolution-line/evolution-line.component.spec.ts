import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { EvolutionLineComponent } from './evolution-line.component';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';

function buildEvolutionLine(): any[][] {
  return [
    [{ speciesName: 'bulbasaur', speciesId: 1, evolutionDetails: [] }],
    [
      {
        speciesName: 'ivysaur',
        speciesId: 2,
        evolutionDetails: [
          {
            trigger: { name: 'level-up', url: '' },
            min_level: 16,
            item: null,
            gender: null,
            held_item: null,
            known_move: null,
            known_move_type: null,
            location: null,
            min_happiness: null,
            min_beauty: null,
            min_affection: null,
            needs_overworld_rain: false,
            party_species: null,
            party_type: null,
            relative_physical_stats: null,
            time_of_day: '',
            trade_species: null,
            turn_upside_down: false,
          },
        ],
      },
    ],
    [{ speciesName: 'venusaur', speciesId: 3, evolutionDetails: [] }],
  ];
}

describe('EvolutionLineComponent', () => {
  let fixture: ComponentFixture<EvolutionLineComponent>;
  let component: EvolutionLineComponent;

  const evolutionLineSignal = signal<any[][]>(buildEvolutionLine());

  const pokemonStoreStub = {
    evolutionLine: evolutionLineSignal,
  };

  beforeEach(async () => {
    evolutionLineSignal.set(buildEvolutionLine());

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
    evolutionLineSignal.set([[{ speciesName: 'ditto', speciesId: 132, evolutionDetails: [] }]]);

    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.detectChanges();

    const noEvolutionMessage = fixture.nativeElement.querySelector('.no-evolution');
    expect(noEvolutionMessage?.textContent).toContain('does not evolve');
  });

  it('renders the evolution method for a stage that requires one', () => {
    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.detectChanges();

    const methodIcon = fixture.nativeElement.querySelector('.evolution-connector .method-icon');
    expect(methodIcon?.getAttribute('aria-label')).toBe('Level 16');
    expect(methodIcon?.querySelector('mat-icon')?.textContent).toContain('trending_up');
  });

  it('renders an item sprite for an item-triggered evolution', () => {
    evolutionLineSignal.set([
      [{ speciesName: 'eevee', speciesId: 133, evolutionDetails: [] }],
      [
        {
          speciesName: 'vaporeon',
          speciesId: 134,
          evolutionDetails: [
            {
              trigger: { name: 'use-item', url: '' },
              item: { name: 'water-stone', url: '' },
              min_level: null,
              gender: null,
              held_item: null,
              known_move: null,
              known_move_type: null,
              location: null,
              min_happiness: null,
              min_beauty: null,
              min_affection: null,
              needs_overworld_rain: false,
              party_species: null,
              party_type: null,
              relative_physical_stats: null,
              time_of_day: '',
              trade_species: null,
              turn_upside_down: false,
            },
          ],
        },
      ],
    ]);

    fixture.componentRef.setInput('versionGroupName', 'red-blue');
    fixture.componentRef.setInput('pokedexName', 'kanto');
    fixture.detectChanges();

    const itemSprite = fixture.nativeElement.querySelector('.method-item-sprite');
    expect(itemSprite?.getAttribute('src')).toContain('water-stone.png');
  });

  it('builds sprite url from species id', () => {
    expect(component.getSpriteUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    );
  });
});
