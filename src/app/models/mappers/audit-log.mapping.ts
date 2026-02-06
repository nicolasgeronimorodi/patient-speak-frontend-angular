import { AuditLogEntity } from '../database-models/audit-log/audit-log.interface';
import { AuditLogViewModel } from '../view-models/audit-log.view.model';

const TABLE_DISPLAY_NAMES: Record<string, string> = {
  patients: 'Paciente',
  transcriptions: 'Transcripcion',
  observations: 'Observacion',
};

const ACTION_DESCRIPTIONS: Record<string, Record<string, string>> = {
  patients: {
    INSERT: 'Creo el paciente',
    UPDATE: 'Modifico datos del paciente',
    DELETE: 'Elimino el paciente permanentemente',
    SELECT: 'Accedio a los datos del paciente',
  },
  transcriptions: {
    INSERT: 'Creo una transcripcion',
    UPDATE: 'Modifico una transcripcion',
    DELETE: 'Elimino una transcripcion',
  },
  observations: {
    INSERT: 'Creo una observacion',
    UPDATE: 'Modifico una observacion',
    DELETE: 'Elimino una observacion',
  },
};

export class AuditLogMappers {
  static toViewModel(entity: AuditLogEntity): AuditLogViewModel {
    return {
      id: entity.id,
      userId: entity.user_id,
      userFullName: entity.user_full_name || 'Sistema',
      action: entity.action,
      tableName: entity.table_name,
      tableDisplayName: TABLE_DISPLAY_NAMES[entity.table_name] || entity.table_name,
      recordId: entity.record_id,
      oldData: entity.old_data,
      newData: entity.new_data,
      createdAt: new Date(entity.created_at),
      description: AuditLogMappers.buildDescription(entity.table_name, entity.action),
    };
  }

  private static buildDescription(tableName: string, action: string): string {
    return ACTION_DESCRIPTIONS[tableName]?.[action] || `${action} en ${tableName}`;
  }
}
