import { PatientEntity } from '../database-models/patient/patient.interface';
import { PatientDetailViewModel } from '../view-models/patient-detail.view.model';
import { PatientFormViewModel } from '../view-models/patient-form.view.model';
import { PatientListItemViewModel } from '../view-models/patient-list-item.view.model';
import {
  DocumentType,
  getDocumentTypeDisplayName,
} from '../enums/document-type.enum';

export class PatientMappers {
  static toListItem(entity: PatientEntity): PatientListItemViewModel {
    return {
      id: entity.id,
      fullName: `${entity.last_name}, ${entity.first_name}`,
      documentTypeId: entity.document_type_id,
      documentTypeName: getDocumentTypeDisplayName(
        entity.document_type_id as DocumentType
      ),
      documentNumber: entity.document_number,
      createdAt: new Date(entity.created_at),
    };
  }

  static toDetail(entity: PatientEntity): PatientDetailViewModel {
    return {
      id: entity.id,
      firstName: entity.first_name,
      lastName: entity.last_name,
      fullName: `${entity.last_name}, ${entity.first_name}`,
      documentTypeId: entity.document_type_id,
      documentTypeName: getDocumentTypeDisplayName(
        entity.document_type_id as DocumentType
      ),
      documentNumber: entity.document_number,
      consentGiven: entity.consent_given,
      consentDate: entity.consent_date ? new Date(entity.consent_date) : null,
      createdAt: new Date(entity.created_at),
      updatedAt: new Date(entity.updated_at),
      isActive: entity.is_active,
    };
  }

  static fromForm(form: PatientFormViewModel): Partial<PatientEntity> {
    return {
      first_name: form.firstName,
      last_name: form.lastName,
      document_type_id: form.documentTypeId,
      document_number: form.documentNumber,
      consent_given: form.consentGiven,
      consent_date: form.consentGiven ? new Date().toISOString() : null,
    };
  }
}
