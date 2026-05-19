import 'dart:convert';
import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:lista_pay/core/database/encrypted_database.dart';
import 'package:lista_pay/domain/repositories/backup_repository.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:sqflite_sqlcipher/sqflite.dart';
import 'package:uuid/uuid.dart';

/// Manual/auto backup to file + Firestore metadata (owner-only via rules).
class BackupRepositoryImpl implements BackupRepository {
  BackupRepositoryImpl(this._db, this._firestore, {required this.storeId});

  final EncryptedDatabase _db;
  final FirebaseFirestore _firestore;
  final String storeId;
  static const _uuid = Uuid();

  @override
  Future<String> createManualBackup() => _createBackup(source: 'manual');

  @override
  Future<void> createAutoBackup() async {
    await _createBackup(source: 'auto');
  }

  Future<String> _createBackup({required String source}) async {
    final id = _uuid.v4();
    final dir = await getApplicationDocumentsDirectory();
    final path = '${dir.path}/backup_$id.json';

    final customers = await _db.database.query('customers', where: 'store_id = ?', whereArgs: [storeId]);
    final transactions = await _db.database.query('transactions', where: 'store_id = ?', whereArgs: [storeId]);

    final payload = jsonEncode({
      'customers': customers,
      'transactions': transactions,
      'created_at': DateTime.now().toIso8601String(),
    });
    final file = File(path);
    await file.writeAsString(payload);

    final now = DateTime.now().millisecondsSinceEpoch;
    await _db.database.insert('backup_meta', {
      'id': id,
      'created_at': now,
      'size_bytes': await file.length(),
      'source': source,
      'local_path': path,
    });

    await _firestore.collection('stores').doc(storeId).collection('backups').doc(id).set({
      'created_at': FieldValue.serverTimestamp(),
      'source': source,
      'size_bytes': await file.length(),
    });

    return id;
  }

  @override
  Future<List<BackupInfo>> listBackups() async {
    final rows = await _db.database.query('backup_meta', orderBy: 'created_at DESC');
    return rows
        .map(
          (r) => BackupInfo(
            id: r['id']! as String,
            createdAt: DateTime.fromMillisecondsSinceEpoch(r['created_at']! as int),
            sizeBytes: r['size_bytes'] as int?,
            source: r['source']! as String,
            cloudPath: r['cloud_path'] as String?,
            localPath: r['local_path'] as String?,
          ),
        )
        .toList();
  }

  @override
  Future<void> restoreFromBackup(String backupId) async {
    final rows = await _db.database.query('backup_meta', where: 'id = ?', whereArgs: [backupId], limit: 1);
    if (rows.isEmpty) throw Exception('Backup not found');
    final path = rows.first['local_path'] as String?;
    if (path == null) throw Exception('No local backup file');

    final payload = jsonDecode(await File(path).readAsString()) as Map<String, dynamic>;
    await _db.runTransaction((txn) async {
      for (final c in payload['customers'] as List) {
        await txn.insert(
          'customers',
          Map<String, Object?>.from(c as Map),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
      for (final t in payload['transactions'] as List) {
        await txn.insert(
          'transactions',
          Map<String, Object?>.from(t as Map),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    });

    await _db.database.update(
      'backup_meta',
      {'restored_at': DateTime.now().millisecondsSinceEpoch},
      where: 'id = ?',
      whereArgs: [backupId],
    );
  }

  @override
  Future<String> exportToFile() async {
    final id = await createManualBackup();
    final rows = await _db.database.query('backup_meta', where: 'id = ?', whereArgs: [id], limit: 1);
    return rows.first['local_path']! as String;
  }

  @override
  Future<void> importFromFile(String filePath) async {
    final id = _uuid.v4();
    await _db.database.insert('backup_meta', {
      'id': id,
      'created_at': DateTime.now().millisecondsSinceEpoch,
      'source': 'manual',
      'local_path': filePath,
    });
    await restoreFromBackup(id);
  }
}
