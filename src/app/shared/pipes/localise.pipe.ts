import { Pipe, PipeTransform } from '@angular/core';
import { NamedAPIResource } from '../interfaces/pokeapi';

interface LocalisableBase {
  language: NamedAPIResource;
}

@Pipe({
  name: 'localise',
})
export class LocalisePipe implements PipeTransform {
  transform<T extends LocalisableBase>(items: T[], language: string, key = 'name'): string {
    const item = items.find((item) => item.language.name === language);
    if (!item) {
      return '';
    }

    if (!(key in item)) {
      return '';
    }

    const value = item[key as keyof T];
    return typeof value === 'string' ? value : '';
  }
}
