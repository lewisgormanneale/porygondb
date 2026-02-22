import { Pipe, PipeTransform } from '@angular/core';

/**
 * Converts hatch_counter from PokeAPI to approximate egg cycles and steps.
 * Formula: steps = (hatch_counter + 1) * 255
 */
@Pipe({
  name: 'hatchSteps',
})
export class HatchStepsPipe implements PipeTransform {
  transform(hatchCounter: number | null | undefined): string {
    if (hatchCounter === null || hatchCounter === undefined) return 'Unknown';
    const cycles = hatchCounter + 1;
    const steps = cycles * 255;
    return `${steps.toLocaleString()} steps`;
  }
}
