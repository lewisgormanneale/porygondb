import { Pipe, PipeTransform } from '@angular/core';
import { NamedAPIResource } from 'pokenode-ts';

interface Localisable {
  language: NamedAPIResource;
  [key: string]: unknown;
}

@Pipe({
  name: 'localise',
})
export class LocalisePipe implements PipeTransform {
  transform(items: Localisable[], language: string, key = 'name'): string {
    const item = items.find((item) => item.language.name === language);
    return item ? (item[key] as string) : '';
  }
}
