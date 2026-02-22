import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, RouterOutlet } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';
import { ThemeStore } from './core/+state/theme.store';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
    OverlayModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'porygondb';
  isOverlayOpen: boolean = false;
  themeStore = inject(ThemeStore);

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/github.svg')
    );
  }
}
