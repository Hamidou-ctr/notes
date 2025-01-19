import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideFirebaseApp(() => initializeApp({ "projectId": "note-e91fa", "appId": "1:731734529783:web:513a8013e5446db01b25f2", "storageBucket": "note-e91fa.firebasestorage.app", "apiKey": "AIzaSyDGHy6-xRzaeCqPPqpYHK3Zy7vF9UPWJWQ", "authDomain": "note-e91fa.firebaseapp.com", "messagingSenderId": "731734529783" })), provideFirestore(() => getFirestore())]
};
