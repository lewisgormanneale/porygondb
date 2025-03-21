import { Component } from "@angular/core";
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { MatIconAnchor } from "@angular/material/button";
import { RouterModule, RouterOutlet } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    RouterModule,
    MatToolbar,
    MatIcon,
    MatIconAnchor,
    NgOptimizedImage,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "porygondb";

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      "github",
      sanitizer.bypassSecurityTrustResourceUrl("assets/icons/github.svg")
    );
  }
}
