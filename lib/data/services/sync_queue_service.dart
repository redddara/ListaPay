import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:lista_pay/core/database/encrypted_database.dart';
import 'package:lista_pay/core/errors/app_exception.dart';
import 'package:lista_pay/domain/repositories/sync_repository.dart';
import 'package:sqflite_sqlcipher/sqflite.dart';

/// Offline-first sync queue with retry and conflict-safe idempotency keys.
class SyncQueueService implements SyncRepository {
  SyncQueueService(this._db, {FirebaseFirestore? firestore, Connectivity? connectivity})
      : _firestore = firestore ?? FirebaseFirestore.instance,
        _connectivity = connectivity ?? Connectivity();

  final EncryptedDatabase _db;
  final FirebaseFirestore _firestore;
  final Connectivity _connectivity;

  static const _maxRetries = 5;

  @override
  Future<void> enqueueChange({
    required String entityType,
    required String entityId,
    required String operation,
    required Map<String, dynamic> payload,
  }) async {
    await _db.database.insert('sync_queue', {
      'entity_type': entityType,
      'entity_id': entityId,
      'operation': operation,
      'payload': jsonEncode(payload),
      'created_at': DateTime.now().millisecondsSinceEpoch,
      'retry_count': 0,
      'status': 'pending',
    });
  }

  @override
  Future<int> processQueue() async {
    final results = await _connectivity.checkConnectivity();
    if (results.contains(ConnectivityResult.none)) {
      throw const NetworkException();
    }

    final pending = await _db.database.query(
      'sync_queue',
      where: 'status IN (?, ?)',
      whereArgs: ['pending', 'failed'],
      orderBy: 'created_at ASC',
      limit: 20,
    );

    var synced = 0;
    for (final row in pending) {
      final id = row['id'] as int;
      try {
        await _pushToFirestore(row);
        await _db.database.update(
          'sync_queue',
          {'status': 'synced'},
          where: 'id = ?',
          whereArgs: [id],
        );
        synced++;
      } catch (e) {
        final retries = (row['retry_count'] as int) + 1;
        await _db.database.update(
          'sync_queue',
          {
            'retry_count': retries,
            'last_error': e.toString(),
            'status': retries >= _maxRetries ? 'failed' : 'pending',
          },
          where: 'id = ?',
          whereArgs: [id],
        );
      }
    }
    return synced;
  }

  Future<void> _pushToFirestore(Map<String, Object?> row) async {
    final payload = jsonDecode(row['payload']! as String) as Map<String, dynamic>;
    final storeId = payload['store_id'] as String;
    final entityType = row['entity_type']! as String;
    final entityId = row['entity_id']! as String;
    final operation = row['operation']! as String;

    final DocumentReference<Map<String, dynamic>> ref;
    switch (entityType) {
      case 'customer':
        ref = _firestore.collection('stores').doc(storeId).collection('customers').doc(entityId);
      case 'transaction':
        final customerId = payload['customer_id'] as String;
        ref = _firestore
            .collection('stores')
            .doc(storeId)
            .collection('customers')
            .doc(customerId)
            .collection('transactions')
            .doc(entityId);
      default:
        throw SyncException(message: 'Unknown entity: $entityType');
    }

    switch (operation) {
      case 'create':
      case 'update':
        await ref.set(payload, SetOptions(merge: true));
      case 'delete':
        await ref.delete();
    }
  }

  @override
  Future<int> pendingCount() async {
    final result = await _db.database.rawQuery(
      "SELECT COUNT(*) as c FROM sync_queue WHERE status IN ('pending', 'failed')",
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  @override
  Stream<int> watchPendingCount() async* {
    while (true) {
      yield await pendingCount();
      await Future<void>.delayed(const Duration(seconds: 5));
    }
  }
}
