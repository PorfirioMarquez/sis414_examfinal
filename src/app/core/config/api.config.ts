// import { InjectionToken } from '@angular/core';

// export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
//   providedIn: 'root',
//   factory: () => '/api',
// });
import { InjectionToken, isDevMode } from '@angular/core';

/** URL de tu backend en Render (sin "/" al final y sin "/api"). */
const RENDER_URL = 'https://sis414-examfinal.onrender.com';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  // En desarrollo (ng serve) usa el proxy; en el build publicado va directo a Render.
  factory: () => (isDevMode() ? '/api' : `${RENDER_URL}/api`),
});