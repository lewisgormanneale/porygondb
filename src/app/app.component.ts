import {Component} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {RouterOutlet} from "@angular/router";

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        MatToolbar,
        MatIcon,
        MatIconButton
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    title = 'porygondb';
}
