import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig } from '@angular/material/dialog';
import { IconRegistration, IconService  } from './components/icon';
import { AccountIconPack, DirectionIconPack, FileIconPack, SharedIconPack } from './components/icon/icon-packs';

export function initializeIcons(iconService: IconService) {
  return () => iconService.registerIconPacks();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyDIN_lvNGWBPi5m6SyLfUN9bwHhYZhkUTs",
      authDomain: "bolt-action-builder-dev.firebaseapp.com",
      projectId: "bolt-action-builder-dev",
      storageBucket: "bolt-action-builder-dev.appspot.com",
      messagingSenderId: "103723210549",
      appId: "1:103723210549:web:404569c31c167a19b8de7c"
    })),
    provideFirestore(() => getFirestore()),
    provideAuth(() => {
      const auth = getAuth();
      //connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      return auth;
    }),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic'
      }
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        width: '600px', // Minimum width for all dialogs
        maxWidth: '95vw', // Maximum width constrained to the viewport
        maxHeight: '95vh',
        disableClose: true
        // You can add other options here as well, like disableClose, autoFocus, etc.
      } as MatDialogConfig
    },
    IconRegistration.register(SharedIconPack),
    IconRegistration.register(DirectionIconPack),
    IconRegistration.register(AccountIconPack),
    IconRegistration.register(FileIconPack),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIcons,
      deps: [IconService],
      multi: true
    }
  ]
};
