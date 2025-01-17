import {Component} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon, MatIconRegistry} from "@angular/material/icon";
import {MatIconAnchor, MatIconButton} from "@angular/material/button";
import {RouterOutlet} from "@angular/router";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        MatToolbar,
        MatIcon,
        MatIconButton,
        MatIconAnchor
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    title = 'porygondb';

    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
        iconRegistry.addSvgIcon(
            'github',
            sanitizer.bypassSecurityTrustResourceUrl('assets/icons/github.svg')
        );
    }

}
