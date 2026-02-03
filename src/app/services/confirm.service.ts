import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(private confirmationService: ConfirmationService) {}

  /**
   * Muestra un diálogo de confirmación para eliminar un elemento.
   * @param itemName El nombre del elemento a eliminar
   * @returns Observable que emite true si se confirma, false si se rechaza
   */
  confirmDelete(itemName: string): Observable<boolean> {
    return new Observable(observer => {
      this.confirmationService.confirm({
        header: 'Confirmar eliminación',
        message: `¿Está seguro de que desea eliminar ${itemName}?`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Eliminar',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => {
          observer.next(true);
          observer.complete();
        },
        reject: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  /**
   * Muestra un diálogo de confirmación genérico.
   * @param header El título del diálogo
   * @param message El mensaje del diálogo
   * @returns Observable que emite true si se confirma, false si se rechaza
   */
  confirmAction(header: string, message: string): Observable<boolean> {
    return new Observable(observer => {
      this.confirmationService.confirm({
        header,
        message,
        icon: 'pi pi-question-circle',
        acceptLabel: 'Aceptar',
        rejectLabel: 'Cancelar',
        accept: () => {
          observer.next(true);
          observer.complete();
        },
        reject: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  /**
   * Muestra un diálogo de confirmación para eliminación permanente de datos.
   * Incluye advertencia fuerte sobre la irreversibilidad de la acción.
   * @param entityName El nombre de la entidad a eliminar permanentemente
   * @returns Observable que emite true si se confirma, false si se rechaza
   */
  confirmHardDelete(entityName: string): Observable<boolean> {
    return new Observable(observer => {
      this.confirmationService.confirm({
        header: 'Eliminacion permanente de datos',
        message: `Esta accion eliminara PERMANENTEMENTE todos los datos de ${entityName}, incluyendo sus transcripciones y observaciones asociadas. Esta accion NO se puede deshacer. ¿Esta seguro de continuar?`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Eliminar permanentemente',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => {
          observer.next(true);
          observer.complete();
        },
        reject: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
