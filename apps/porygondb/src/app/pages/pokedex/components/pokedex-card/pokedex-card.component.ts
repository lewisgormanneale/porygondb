import { Component, Input, signal, WritableSignal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { LocalisePipe } from '../../../../pipes/localise.pipe';
import { PokedexResult } from 'data-access';

@Component({
  selector: 'app-pokedex-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    LocalisePipe,
  ],
  templateUrl: 'pokedex-card.component.html',
  styleUrl: 'pokedex-card.component.scss',
})
export class PokedexCardComponent {
  @Input() pokemon: PokedexResult = {} as PokedexResult;
  imageLoading: WritableSignal<boolean> = signal(true);

  onImageLoad() {
    this.imageLoading.set(false);
  }
}
