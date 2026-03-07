import { Pipe, PipeTransform } from '@angular/core';

/**
 * Cleans flavor text from PokeAPI by replacing control characters
 * (form feed, newlines, carriage returns) with proper spaces.
 */
@Pipe({
  name: 'cleanFlavorText',
})
export class CleanFlavorTextPipe implements PipeTransform {
  transform(text: string | null | undefined): string {
    if (!text) return '';
    // Replace form feed (\f), newlines (\n), carriage returns (\r), and soft hyphens with spaces
    // Then collapse multiple spaces into one and trim
    return text
      .replace(/[\f\n\r\u00ad]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
