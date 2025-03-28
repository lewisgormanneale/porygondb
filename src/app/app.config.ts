import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { provideProtractorTestingSupport } from "@angular/platform-browser";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { MatIconRegistry } from "@angular/material/icon";
import { provideHttpClient } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideProtractorTestingSupport(),
    provideAnimationsAsync(),
    provideHttpClient(),
    MatIconRegistry,
  ],
};
