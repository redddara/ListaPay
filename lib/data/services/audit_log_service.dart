import 'dart:convert';

import 'package:lista_pay/core/database/encrypted_database.dart';
import 'package:uuid/uuid.dart';

/// Immutable audit trail — login, CRUD, sync events.
class AuditLogService {
  AuditLogService(this._db);

  final EncryptedDatabase _db;
  static const _uuid = Uuid();

  Future<void> log({
    required String storeId,
    required String userId,
    String? userEmail,
    required String action,
    String? entityType,
    String? entityId,
    Map<String, dynamic>? details,
  }) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    await _db.database.insert('audit_logs', {
      'id': _uuid.v4(),
      'store_id': storeId,
      'user_id': userId,
      'user_email': userEmail,
      'action': action,
      'entity_type': entityType,
      'entity_id': entityId,
      'details': details != null ? jsonEncode(details) : null,
      'created_at': now,
    });
  }
}
