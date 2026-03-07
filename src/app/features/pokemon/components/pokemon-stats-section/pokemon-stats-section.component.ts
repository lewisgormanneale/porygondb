import { Component, computed, inject } from '@angular/core';
import { PokemonStore } from '../../../../shared/+state/pokemon.store';

interface StatRow {
  key: string;
  label: string;
  value: number;
}

@Component({
  selector: 'pokemon-stats-section',
  templateUrl: './pokemon-stats-section.component.html',
  styleUrl: './pokemon-stats-section.component.scss',
})
export class PokemonStatsSectionComponent {
  readonly pokemonStore = inject(PokemonStore);

  private readonly statsOrder: Array<{ key: string; label: string }> = [
    { key: 'hp', label: 'HP' },
    { key: 'attack', label: 'Attack' },
    { key: 'defense', label: 'Defense' },
    { key: 'special-attack', label: 'Sp. Atk' },
    { key: 'special-defense', label: 'Sp. Def' },
    { key: 'speed', label: 'Speed' },
  ];

  readonly maxBaseStat = 255;
  readonly chartSize = 280;
  readonly chartCenter = this.chartSize / 2;
  readonly chartRadius = 100;

  readonly statRows = computed<StatRow[]>(() => {
    const selectedStats = this.pokemonStore.selectedPokemonStats();

    return this.statsOrder.map((stat) => ({
      key: stat.key,
      label: stat.label,
      value: selectedStats[stat.key] ?? 0,
    }));
  });

  readonly baseStatTotal = computed(() =>
    this.statRows()
      .map((stat) => stat.value)
      .reduce((accumulator, current) => accumulator + current, 0)
  );

  readonly radarPoints = computed(() => {
    return this.statRows()
      .map((stat, index) => {
        const scale = Math.min(stat.value / this.maxBaseStat, 1);
        return this.getPoint(index, scale);
      })
      .map((point) => `${point.x},${point.y}`)
      .join(' ');
  });

  readonly axisLabelPoints = computed(() => {
    return this.statRows().map((stat, index) => ({
      label: stat.label,
      ...this.getPoint(index, 1.18),
    }));
  });

  readonly gridPolygons = computed(() => {
    const levels = [0.2, 0.4, 0.6, 0.8, 1];

    return levels.map((level) =>
      this.statRows()
        .map((_, index) => {
          const point = this.getPoint(index, level);
          return `${point.x},${point.y}`;
        })
        .join(' ')
    );
  });

  readonly axisLines = computed(() => {
    return this.statRows().map((_, index) => {
      const point = this.getPoint(index, 1);
      return {
        x1: this.chartCenter,
        y1: this.chartCenter,
        x2: point.x,
        y2: point.y,
      };
    });
  });

  private getPoint(index: number, scale: number): { x: number; y: number } {
    const angleInRadians = ((-90 + index * 60) * Math.PI) / 180;
    const radius = this.chartRadius * scale;

    return {
      x: this.chartCenter + radius * Math.cos(angleInRadians),
      y: this.chartCenter + radius * Math.sin(angleInRadians),
    };
  }
}
