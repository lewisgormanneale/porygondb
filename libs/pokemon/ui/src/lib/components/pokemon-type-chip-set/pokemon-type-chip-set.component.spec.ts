import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokemonTypeChipSetComponent } from './pokemon-type-chip-set.component';

describe('PokemonTypeChipsComponent', () => {
  let component: PokemonTypeChipSetComponent;
  let fixture: ComponentFixture<PokemonTypeChipSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonTypeChipSetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonTypeChipSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
