import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PokemonTypeChipComponent } from "./pokemon-type-chip.component";

describe("PokemonTypeChipsComponent", () => {
  let component: PokemonTypeChipComponent;
  let fixture: ComponentFixture<PokemonTypeChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonTypeChipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonTypeChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
