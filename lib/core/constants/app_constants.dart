/// App-wide constants for security, sync, and UX.
abstract final class AppConstants {
  static const String dbName = 'lista_pay_encrypted.db';
  static const int dbVersion = 1;

  /// Auto-logout after 30 minutes of inactivity.
  static const Duration sessionTimeout = Duration(minutes: 30);

  /// Background sync interval (Workmanager).
  static const Duration backgroundSyncInterval = Duration(hours: 6);

  static const int defaultPageSize = 50;

  /// Minimum password length for Firebase email auth.
  static const int minPasswordLength = 8;

  static const int pinLength = 6;

  /// Soft-deleted records kept for 90 days before purge.
  static const Duration trashRetention = Duration(days: 90);
}
