import 'package:lista_pay/core/constants/app_constants.dart';
import 'package:lista_pay/core/security/secure_storage_service.dart';

/// Tracks activity and enforces auto-logout after inactivity.
class SessionManager {
  SessionManager(this._secureStorage);

  final SecureStorageService _secureStorage;

  Future<void> recordActivity() => _secureStorage.updateLastActivity();

  Future<bool> isSessionExpired() async {
    final last = await _secureStorage.getLastActivity();
    if (last == null) return true;
    return DateTime.now().difference(last) > AppConstants.sessionTimeout;
  }

  Future<void> endSession() => _secureStorage.clearSession();
}
