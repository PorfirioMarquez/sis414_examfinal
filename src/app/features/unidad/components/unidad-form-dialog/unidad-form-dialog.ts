import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit, Component, ElementRef, OnInit,
  inject, input, output, signal, viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Unidad } from '../../models/unidad.model';
import { UnidadService } from '../../services/unidad.service';

@Component({
  selector: 'app-unidad-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './unidad-form-dialog.html',
  styleUrl: './unidad-form-dialog.scss',
})
export class UnidadFormDialog implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UnidadService);

  readonly unidad = input<Unidad | null>(null);   // null = nueva
  readonly closed = output<void>();
  readonly saved = output<Unidad>();

  private readonly codigoInput = viewChild.required<ElementRef<HTMLInputElement>>('codigo');
  private readonly descripcionInput = viewChild.required<ElementRef<HTMLInputElement>>('descripcion');

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly ciudades = [
    'LA PAZ', 'COCHABAMBA', 'SANTA CRUZ', 'ORURO', 'POTOSI',
    'SUCRE', 'TARIJA', 'TRINIDAD', 'COBIJA',
  ];

  private static readonly NO_BLANCO = Validators.pattern(/\S/);

  protected readonly form = this.fb.nonNullable.group({
    unidad: ['', [Validators.required, UnidadFormDialog.NO_BLANCO, Validators.maxLength(10)]],
    descripcion: ['', [Validators.required, UnidadFormDialog.NO_BLANCO, Validators.maxLength(100)]],
    ciudad: ['', [Validators.required, UnidadFormDialog.NO_BLANCO, Validators.maxLength(50)]],
  });

  protected get editando(): boolean {
    return this.unidad() !== null;
  }

  ngOnInit(): void {
    const actual = this.unidad();
    if (actual) {
      this.form.setValue(actual);
      this.form.controls.unidad.disable(); // el código es la clave
    }
  }

  ngAfterViewInit(): void {
    (this.editando ? this.descripcionInput() : this.codigoInput()).nativeElement.focus();
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const actual = this.unidad();
    const raw = this.form.getRawValue();
    const datos: Unidad = {
      unidad: raw.unidad.trim(),
      descripcion: raw.descripcion.trim(),
      ciudad: raw.ciudad.trim(),
    };

    this.error.set(null);
    this.saving.set(true);
    const peticion = actual
      ? this.service.update(actual.unidad, datos)
      : this.service.create(datos);

    peticion.subscribe({
      next: (guardada) => this.saved.emit(guardada),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(this.mensaje(err));
      },
    });
  }

  private mensaje(err: HttpErrorResponse): string {
    switch (err.status) {
      case 409: return 'Ya existe una unidad con ese código';
      case 400:
      case 422: return 'Los datos ingresados no son válidos';
      case 0: return 'No se pudo conectar con el servidor';
      default: return 'No se pudo guardar la unidad';
    }
  }
}