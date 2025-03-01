import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokemonMovesTabComponent } from './pokemon-moves-tab.component';

describe('PokemonMovesTabComponent', () => {
  let component: PokemonMovesTabComponent;
  let fixture: ComponentFixture<PokemonMovesTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonMovesTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonMovesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
