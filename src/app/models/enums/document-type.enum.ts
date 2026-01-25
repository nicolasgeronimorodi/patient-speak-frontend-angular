/**
 * Document type IDs matching database document_types table.
 * Values must match exactly with document_types.id in the database.
 */
export enum DocumentType {
  DNI = 1,
  CivicBooklet = 2,
  EnlistmentBooklet = 3,
  Passport = 4
}

/**
 * Maps document type ID to display name for UI.
 * @param id - The document type ID from database
 * @returns The human-readable display name in Spanish
 */
export function getDocumentTypeDisplayName(id: DocumentType): string {
  switch (id) {
    case DocumentType.DNI:
      return 'DNI';
    case DocumentType.CivicBooklet:
      return 'Libreta Civica';
    case DocumentType.EnlistmentBooklet:
      return 'Libreta de Enrolamiento';
    case DocumentType.Passport:
      return 'Pasaporte';
    default:
      return 'Desconocido';
  }
}
