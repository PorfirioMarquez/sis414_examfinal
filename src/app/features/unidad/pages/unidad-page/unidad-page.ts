import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { UnidadAdminDialog } from '../../components/unidad-admin-dialog/unidad-admin-dialog';
import { Unidad } from '../../models/unidad.model';

@Component({
  selector: 'app-unidad-page',
  imports: [UnidadAdminDialog],
  template: '<app-unidad-admin-dialog (closed)="salir()" (selected)="seleccionar($event)" />',
})
export class UnidadPage {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  protected salir(): void {
    this.router.navigateByUrl('/home');
  }

  protected seleccionar(unidad: Unidad): void {
    this.auth.setUnidad({ codigo: unidad.unidad, nombre: unidad.descripcion });
    this.salir();
  }
}

