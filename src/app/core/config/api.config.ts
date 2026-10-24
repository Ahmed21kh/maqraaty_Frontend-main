import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Base URL of the REST API, e.g. `http://localhost:8000/api/`. */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => `${environment.apiUrl}api/`,
});

/** Origin that serves uploaded files (student images). */
export const FILES_URL = new InjectionToken<string>('FILES_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});

/** Socket.IO endpoint of the WhatsApp bridge. */
export const SOCKET_URL = new InjectionToken<string>('SOCKET_URL', {
  providedIn: 'root',
  factory: () => environment.socketUrl,
});
