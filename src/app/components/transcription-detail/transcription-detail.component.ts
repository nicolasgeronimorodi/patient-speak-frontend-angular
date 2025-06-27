import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObservationActionKey } from '../../enums/observation-action-key';
import { PermissionName } from '../../models/permission.model';
import { TranscriptionDetailViewModel } from '../../models/view-models/transcription-detail.view.model';
import { AuthService } from '../../services/auth.service';
import {
  ActionTypeEnum,
  EntityTypeEnum,
  PermissionContextService,
} from '../../services/permission-context.service';
import { TranscriptionService } from '../../services/transcription.service';
import { ObservationNewComponent } from '../observation-new/observation-new.component';
import { ToastService } from '../../services/common/toast.service';
import { BreadcrumbService } from '../../services/common/breadcrumb.service';
import { jsPDF } from 'jspdf';
import { PdfHelperService } from '../../services/common/pdf-helper.service';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-transcription-detail',
  imports: [CommonModule, ObservationNewComponent, MenuModule, ButtonModule],
  templateUrl: './transcription-detail.component.html',
  styleUrl: './transcription-detail.component.css',
})
export class TranscriptionDetailComponent implements OnInit, OnDestroy {
  transcriptionId: string | null = null;
  transcription: TranscriptionDetailViewModel | null = null;
  loading = true;
  errorMessage: string | null = null;
  showAddObservation = false;
  canAddObservation = false;
  currentUserId: string | null = null;

  menuItems: MenuItem[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly transcriptionService: TranscriptionService,
    private readonly permissionContextService: PermissionContextService,
    private readonly toastService: ToastService,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly pdfHelperService: PdfHelperService,
    private readonly router: Router
  ) {}

  validateCreateObservationPermission(): void {
    // Permisos
    this.permissionContextService
      .validateAuthorizationForAction(
        /*
                TODO: Validacion incorrecta
            
                          Debería ser
                            ActionTypeEnum.Create,
                            EntityTypeEnum.Observation,
                            this.transcriptionId

                  Se debe corregir en backend: (valores de tablas y revisar función validadora)      
                */
        ActionTypeEnum.ReadObservations,
        EntityTypeEnum.Transcription,
        this.transcriptionId
      )
      .subscribe({
        next: (result) => {
          this.canAddObservation = result;
          this.buildMenuItems();
        },
        error: (err) => {
          console.error('Error checking permissions', err);
          this.canAddObservation = false;
        },
      });
  }

  ngOnInit(): void {
    this.buildBreadcrumb();

    this.transcriptionId = this.route.snapshot.paramMap.get('id');
    if (!this.transcriptionId) {
      this.errorMessage = 'ID de transcripción inválido.';
      this.loading = false;
      return;
    }

    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUserId = user?.id ?? null;

      this.transcriptionService
        .getTranscriptionById(this.transcriptionId!)
        .subscribe({
          next: (data) => {
            this.transcription = data;
            this.loading = false;
          },
          error: (err) => {
            this.errorMessage = err.message;
            this.loading = false;
          },
        });
    });
    this.validateCreateObservationPermission();
  }

  buildBreadcrumb() {
    this.breadcrumbService.buildBreadcrumb([
      {
        label: 'Home',
        command: () => this.router.navigate(['/home']),
      },
      {
        label: 'Transcripciones',
        command: () => this.router.navigate(['/transcriptions']),
      },
      {
        label: 'Ver detalle',
      },
    ]);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clear();
  }

  toggleObservationPanel(): void {
    this.showAddObservation = !this.showAddObservation;
    this.buildMenuItems();
  }

  goToObservations(): void {
    if (!this.transcription?.id) return;
    this.router.navigate([
      '/transcriptions',
      this.transcription.id,
      'observations',
    ]);
  }

  buildMenuItems(): void {
    this.menuItems = [
      {
        label: 'Descargar como PDF',
        icon: 'pi pi-file-pdf',
        command: () => this.downloadPdf(),
      },
      {
        label: 'Ver observaciones',
        icon: 'pi pi-eye',
        command: () => this.goToObservations(),
      },
      {
        visible: this.canAddObservation,
        label: this.showAddObservation
          ? 'Ocultar panel de nueva observación'
          : 'Agregar observación',
        icon: this.showAddObservation ? 'pi pi-eye-slash' : 'pi pi-plus',
        command: () => this.toggleObservationPanel(),
      },
      {
        label: 'Enviar por correo electrónico',
        icon: 'pi pi-envelope',
        command: () => this.sendTranscriptionEmailToCurrentUser(),
      },
    ];
  }

  sendTranscriptionEmailToCurrentUser(): void {
    if (!this.transcription?.id) return;

    this.transcriptionService
      .sendTranscriptionToCurrentUserEmail(this.transcription.id)
      .subscribe({
        next: () =>
          this.toastService.showSuccess(
            'Correo enviado',
            'La transcripción ha sido enviada al correo electrónico.'
          ),
        error: (err) =>
          this.toastService.showError('Error al enviar correo', err.message),
      });
  }

  downloadPdf(): void {
    if (!this.transcription) return;

    this.pdfHelperService.generateSimplePdf({
      filename: `transcripcion_${this.transcription.id}.pdf`,
      title: 'Detalle de Transcripción',
      fields: [
        { label: 'Título', value: this.transcription.title },
        { label: 'Idioma', value: this.transcription.language },
        {
          label: 'Fecha de creación',
          value: new Date(this.transcription.createdAt).toLocaleString('es-AR'),
        },
        { label: 'Categoría', value: this.transcription.tagName },
        {
          label: 'Usuario operador',
          value: this.transcription.operatorUserFullName,
        },
      ],
      extraSections: [
        {
          sectionTitle: 'Información del paciente',
          fields: [
            { label: 'DNI', value: this.transcription.dni ?? '-' },
            { label: 'Nombre', value: this.transcription.firstName ?? '-' },
            { label: 'Apellido', value: this.transcription.lastName ?? '-' },
          ],
        },
      ],
      longTextFieldLabel: 'Contenido',
      longText: this.transcription.content,
    });
  }
  goBack(): void {
    this.router.navigate(['/home']);
  }
}
