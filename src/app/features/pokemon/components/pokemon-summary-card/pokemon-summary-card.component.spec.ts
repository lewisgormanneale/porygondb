import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PokemonSummaryCardComponent } from "./pokemon-summary-card.component";

describe("SummaryCardComponent", () => {
  let component: PokemonSummaryCardComponent;
  let fixture: ComponentFixture<PokemonSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonSummaryCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
