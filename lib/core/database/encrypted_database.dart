import 'dart:math';

import 'package:lista_pay/core/constants/app_constants.dart';
import 'package:lista_pay/core/database/database_schema.dart';
import 'package:lista_pay/core/errors/app_exception.dart';
import 'package:lista_pay/core/security/secure_storage_service.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite_sqlcipher/sqflite.dart';

/// Opens SQLCipher-encrypted SQLite — passphrase never written to disk in plain text.
class EncryptedDatabase {
  EncryptedDatabase(this._secureStorage);

  final SecureStorageService _secureStorage;
  Database? _db;

  Database get database {
    final db = _db;
    if (db == null) {
      throw const LocalDatabaseException(
        message: 'Database hindi pa naka-open. Tumawag muna sa init().',
      );
    }
    return db;
  }

  Future<void> init() async {
    if (_db != null) return;

    final passphrase = await _getOrCreatePassphrase();
    final dir = await getApplicationDocumentsDirectory();
    final path = p.join(dir.path, AppConstants.dbName);

    _db = await openDatabase(
      path,
      password: passphrase,
      version: AppConstants.dbVersion,
      onCreate: (db, version) async {
        for (final sql in DatabaseSchema.all) {
          await db.execute(sql);
        }
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        // Future migrations go here — never drop customer data silently.
      },
    );
  }

  Future<String> _getOrCreatePassphrase() async {
    var passphrase = await _secureStorage.getDbPassphrase();
    if (passphrase != null && passphrase.isNotEmpty) return passphrase;

    passphrase = _generatePassphrase();
    await _secureStorage.setDbPassphrase(passphrase);
    return passphrase;
  }

  String _generatePassphrase() {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#\$%^&*';
    final random = Random.secure();
    return List.generate(64, (_) => chars[random.nextInt(chars.length)]).join();
  }

  /// Atomic batch for crash-safe multi-table updates.
  Future<T> runTransaction<T>(Future<T> Function(Transaction txn) action) {
    return database.transaction(action);
  }

  Future<void> close() async {
    await _db?.close();
    _db = null;
  }
}
