import { ApplicationConfig, LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { spinnerInterceptor } from './core/http/spinner.interceptor';
import { provideCharts } from './core/config/echarts.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    // El calendario de Material deriva el idioma de LOCALE_ID
    { provide: LOCALE_ID, useValue: 'es' },
    provideHttpClient(withInterceptors([spinnerInterceptor, authInterceptor, errorInterceptor])),
    // Regla general: los snackbars se cierran solos (por defecto quedan fijos).
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 4000 } },
    provideCharts(),
  ],
};
