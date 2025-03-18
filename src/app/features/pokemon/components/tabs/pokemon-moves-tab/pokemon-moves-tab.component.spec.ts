import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PokemonMovesTabComponent } from "./pokemon-moves-tab.component";
import { MoveStore } from "../../../../../shared/store/move.store";
import { PokemonStore } from "../../../../../shared/store/pokemon.store";
import { provideNoopAnimations } from "@angular/platform-browser/animations";

describe("PokemonMovesTabComponent", () => {
  let component: PokemonMovesTabComponent;
  let fixture: ComponentFixture<PokemonMovesTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonMovesTabComponent],
      providers: [MoveStore, PokemonStore, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonMovesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
