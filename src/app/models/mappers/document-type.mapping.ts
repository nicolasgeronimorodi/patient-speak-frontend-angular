import { DocumentTypeEntity } from '../database-models/document-type/document-type.interface';
import { DocumentTypeViewModel } from '../view-models/document-type.view.model';

export class DocumentTypeMappers {
  static toViewModel(entity: DocumentTypeEntity): DocumentTypeViewModel {
    return {
      id: entity.id,
      name: entity.name,
      code: entity.code
    };
  }
}
