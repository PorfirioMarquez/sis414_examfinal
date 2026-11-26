import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, output, signal } from '@angular/core';
import { Unidad } from '../../models/unidad.model';
import { UnidadService } from '../../services/unidad.service';
import { UnidadFormDialog } from '../unidad-form-dialog/unidad-form-dialog';

const MIN_FILAS = 7;

@Component({
  selector: 'app-unidad-admin-dialog',
  imports: [UnidadFormDialog],
  templateUrl: './unidad-admin-dialog.html',
  styleUrl: './unidad-admin-dialog.scss',
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '(window:focus)': 'cargar()', // al volver desde Swagger se recarga la tabla
  },
})
export class UnidadAdminDialog {
  private readonly service = inject(UnidadService);

  readonly closed = output<void>();
  readonly selected = output<Unidad>();

  protected readonly modoDemo = this.service.modoDemo;
  protected readonly unidades = signal<Unidad[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly form = signal<'nuevo' | Unidad | null>(null);
  protected readonly formUnidad = computed(() => {
    const f = this.form();
    return f === 'nuevo' ? null : f;
  });
  protected readonly confirmar = signal<Unidad | null>(null);

  protected readonly current = computed(
    () => this.unidades().find((u) => u.unidad === this.selectedId()) ?? null,
  );
  protected readonly filler = computed(() =>
    Array.from({ length: Math.max(0, MIN_FILAS - this.unidades().length) }),
  );

  constructor() {
    this.cargar();
  }

  protected cargar(selectId?: string | null): void {
    this.service.list().subscribe({
      next: (lista) => {
        this.unidades.set(lista);
        this.error.set(null);
        this.loading.set(false);
        const wanted = selectId ?? this.selectedId();
        const exists = lista.some((u) => u.unidad === wanted);
        this.selectedId.set(exists ? wanted! : (lista[0]?.unidad ?? null));
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar las unidades: error al conectar con el servidor');
      },
    });
  }

  protected nuevo(): void { this.form.set('nuevo'); }

  protected editar(): void {
    const u = this.current();
    if (u) this.form.set(u);
  }

  protected onGuardado(u: Unidad): void {
    this.form.set(null);
    this.cargar(u.unidad);
  }

  protected pedirEliminar(): void {
    const u = this.current();
    if (u) this.confirmar.set(u);
  }

  protected eliminar(): void {
    const u = this.confirmar();
    if (!u) return;
    this.confirmar.set(null);
    this.service.remove(u.unidad).subscribe({
      next: () => this.cargar(null),
      error: (err: HttpErrorResponse) =>
        this.error.set(
          err.status === 409
            ? 'No se puede eliminar: la unidad tiene datos asociados'
            : 'No se pudo eliminar la unidad',
        ),
    });
  }

  protected seleccionar(): void {
    const u = this.current();
    if (u) this.selected.emit(u);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const lista = this.unidades();
    const i = lista.findIndex((u) => u.unidad === this.selectedId());
    if (event.key === 'ArrowDown' && i < lista.length - 1) this.selectedId.set(lista[i + 1].unidad);
    else if (event.key === 'ArrowUp' && i > 0) this.selectedId.set(lista[i - 1].unidad);
    else if (event.key === 'Enter') this.seleccionar();
    else return;
    event.preventDefault();
  }

  protected onEscape(): void {
    if (this.form()) return;
    if (this.confirmar()) this.confirmar.set(null);
    else this.closed.emit();
  }
}