import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { Unidad } from '../models/unidad.model';

interface UnidadDto { codigo: string; descripcion: string; ciudad: string; }

const toUnidad = (d: UnidadDto): Unidad => ({ unidad: d.codigo, descripcion: d.descripcion, ciudad: d.ciudad });
const toDto = (u: Unidad): UnidadDto => ({ codigo: u.unidad, descripcion: u.descripcion, ciudad: u.ciudad });

const DEMO_UNIDADES: Unidad[] = [
  { unidad: '23', descripcion: '23ACTIVOS', ciudad: 'LA PAZ' },
  { unidad: '34', descripcion: 'CARRERA DE ING DE SISTEMAS', ciudad: 'POTOSI' },
  { unidad: 'fj', descripcion: 'FJ ACTIVOS FIJOS', ciudad: 'POTOSI' },
  { unidad: 'siste', descripcion: 'CARRERA ING SISTEMAS', ciudad: 'POTOSI' },
];
const SIN_BACKEND = [0, 404, 502, 503, 504];

@Injectable({ providedIn: 'root' })
export class UnidadService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/unidades`;
  private demoStore: Unidad[] = [...DEMO_UNIDADES];
  readonly modoDemo = signal(false);

  list(): Observable<Unidad[]> {
    return this.http.get<UnidadDto[]>(this.url).pipe(
      map((l) => l.map(toUnidad)),
      tap(() => this.modoDemo.set(false)),
      catchError((err: HttpErrorResponse) => {
        if (DEMO_MODE && SIN_BACKEND.includes(err.status)) {
          this.modoDemo.set(true);
          return of([...this.demoStore]);
        }
        return throwError(() => err);
      }),
    );
  }

  create(unidad: Unidad): Observable<Unidad> {
    if (this.modoDemo()) {
      if (this.demoStore.some((u) => u.unidad === unidad.unidad)) {
        return throwError(() => new HttpErrorResponse({ status: 409 }));
      }
      this.demoStore = [...this.demoStore, unidad];
      return of(unidad);
    }
    return this.http.post<UnidadDto>(this.url, toDto(unidad)).pipe(map(toUnidad));
  }

  update(codigo: string, unidad: Unidad): Observable<Unidad> {
    if (this.modoDemo()) {
      this.demoStore = this.demoStore.map((u) => (u.unidad === codigo ? unidad : u));
      return of(unidad);
    }
    return this.http
      .put<UnidadDto>(`${this.url}/${encodeURIComponent(codigo)}`, toDto(unidad))
      .pipe(map(toUnidad));
  }

  remove(codigo: string): Observable<void> {
    if (this.modoDemo()) {
      this.demoStore = this.demoStore.filter((u) => u.unidad !== codigo);
      return of(undefined);
    }
    return this.http.delete<void>(`${this.url}/${encodeURIComponent(codigo)}`);
  }
}