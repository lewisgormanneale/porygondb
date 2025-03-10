import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PokemonSummaryComponent } from "./pokemon-summary.component";

describe("SummaryCardComponent", () => {
  let component: PokemonSummaryComponent;
  let fixture: ComponentFixture<PokemonSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
