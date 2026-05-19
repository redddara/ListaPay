import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Wraps Flutter Secure Storage for keys, PIN hash, and encryption passphrase.
class SecureStorageService {
  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
              iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock_this_device),
            );

  final FlutterSecureStorage _storage;

  static const _dbPassphraseKey = 'db_passphrase';
  static const _pinHashKey = 'pin_hash';
  static const _pinSaltKey = 'pin_salt';
  static const _sessionTokenKey = 'session_token';
  static const _lastActivityKey = 'last_activity_ms';
  static const _appLockEnabledKey = 'app_lock_enabled';
  static const _biometricEnabledKey = 'biometric_enabled';

  Future<String?> read(String key) => _storage.read(key: key);
  Future<void> write(String key, String value) => _storage.write(key: key, value: value);
  Future<void> delete(String key) => _storage.delete(key: key);

  Future<String?> getDbPassphrase() => read(_dbPassphraseKey);
  Future<void> setDbPassphrase(String value) => write(_dbPassphraseKey, value);

  Future<String?> getPinHash() => read(_pinHashKey);
  Future<void> setPinHash(String value) => write(_pinHashKey, value);

  Future<String?> getPinSalt() => read(_pinSaltKey);
  Future<void> setPinSalt(String value) => write(_pinSaltKey, value);

  Future<bool> isAppLockEnabled() async =>
      (await read(_appLockEnabledKey)) == 'true';

  Future<void> setAppLockEnabled(bool enabled) =>
      write(_appLockEnabledKey, enabled.toString());

  Future<bool> isBiometricEnabled() async =>
      (await read(_biometricEnabledKey)) == 'true';

  Future<void> setBiometricEnabled(bool enabled) =>
      write(_biometricEnabledKey, enabled.toString());

  Future<void> updateLastActivity() =>
      write(_lastActivityKey, DateTime.now().millisecondsSinceEpoch.toString());

  Future<DateTime?> getLastActivity() async {
    final raw = await read(_lastActivityKey);
    if (raw == null) return null;
    return DateTime.fromMillisecondsSinceEpoch(int.parse(raw));
  }

  Future<void> clearSession() async {
    await delete(_sessionTokenKey);
    await delete(_lastActivityKey);
  }

  Future<void> clearAll() => _storage.deleteAll();
}
