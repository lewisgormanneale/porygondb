import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';
import { CaptureRatePipe } from '../../../../shared/pipes/captureRate.pipe';
import { HatchStepsPipe } from '../../../../shared/pipes/hatchSteps.pipe';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'pokemon-additional-info',
  imports: [MatCardModule, CaptureRatePipe, HatchStepsPipe, TitleCasePipe],
  templateUrl: './pokemon-additional-info.component.html',
  styleUrl: './pokemon-additional-info.component.scss',
})
export class PokemonAdditionalInfoComponent {
  readonly pokemonStore = inject(PokemonStore);

  getShapeIcon(shapeName: string): string {
    const shapeIcons: Record<string, string> = {
      ball: 'circle',
      squiggle: 'gesture',
      fish: 'water',
      arms: 'back_hand',
      blob: 'bubble_chart',
      upright: 'accessibility_new',
      legs: 'directions_walk',
      quadruped: 'pets',
      wings: 'raven',
      tentacles: 'waves',
      heads: 'add_reaction',
      humanoid: 'person',
      'bug-wings': 'pest_control',
      armor: 'shield',
    };
    return shapeIcons[shapeName] || 'help';
  }
}
