import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DocumentType } from '../models/enums/document-type.enum';

/**
 * Validation patterns for Argentine document types.
 * DNI, Libreta Civica, Libreta de Enrolamiento: 7-8 numeric digits
 * Passport: 3 letters followed by 6 numbers (AAA000000)
 */
export const DOCUMENT_VALIDATION_PATTERNS: Record<DocumentType, RegExp> = {
  [DocumentType.DNI]: /^\d{7,8}$/,
  [DocumentType.CivicBooklet]: /^\d{7,8}$/,
  [DocumentType.EnlistmentBooklet]: /^\d{7,8}$/,
  [DocumentType.Passport]: /^[A-Za-z]{3}\d{6}$/
};

/**
 * Error messages for document validation failures in Spanish.
 */
export const DOCUMENT_VALIDATION_MESSAGES: Record<DocumentType, string> = {
  [DocumentType.DNI]: 'El DNI debe tener 7 u 8 digitos numericos',
  [DocumentType.CivicBooklet]: 'La Libreta Civica debe tener 7 u 8 digitos numericos',
  [DocumentType.EnlistmentBooklet]: 'La Libreta de Enrolamiento debe tener 7 u 8 digitos numericos',
  [DocumentType.Passport]: 'El Pasaporte debe tener 3 letras seguidas de 6 numeros (Ej: AAA123456)'
};

export interface DocumentValidationResult {
  invalid: boolean;
  message: string;
}

export class DocumentValidator {
  /**
   * Validates a document number based on the document type.
   * Returns null if valid or document number is empty,
   * or an error object with message if invalid.
   * @param documentType - The document type ID from enum
   * @param documentNumber - The document number to validate
   * @returns Validation error object or null if valid
   */
  static validate(
    documentType: DocumentType | null,
    documentNumber: string | null
  ): DocumentValidationResult | null {
    if (!documentNumber || documentNumber.trim() === '') {
      return null;
    }

    if (!documentType) {
      return null;
    }

    const pattern = DOCUMENT_VALIDATION_PATTERNS[documentType];
    if (!pattern) {
      return null;
    }

    const normalizedNumber = documentNumber.trim().toUpperCase();

    if (!pattern.test(normalizedNumber)) {
      return {
        invalid: true,
        message: DOCUMENT_VALIDATION_MESSAGES[documentType]
      };
    }

    return null;
  }

  /**
   * Creates a reactive form validator function for document numbers.
   * Requires a function that returns the current document type.
   * @param getDocumentType - Function returning current document type
   * @returns Angular ValidatorFn for use with reactive forms
   */
  static createValidator(
    getDocumentType: () => DocumentType | null
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const documentNumber = control.value;
      const documentType = getDocumentType();

      const result = DocumentValidator.validate(documentType, documentNumber);

      if (result) {
        return { documentFormat: result.message };
      }

      return null;
    };
  }

  /**
   * Formats document number based on type.
   * Converts passport numbers to uppercase.
   * @param documentType - The document type
   * @param documentNumber - The document number
   * @returns Formatted document number or null
   */
  static formatDocumentNumber(
    documentType: DocumentType | null,
    documentNumber: string | null
  ): string | null {
    if (!documentNumber) {
      return null;
    }

    if (documentType === DocumentType.Passport) {
      return documentNumber.trim().toUpperCase();
    }

    return documentNumber.trim();
  }
}
