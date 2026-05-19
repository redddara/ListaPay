/// Typed application errors for consistent UI messaging and recovery.
sealed class AppException implements Exception {
  const AppException(this.message, {this.recoveryHint});

  final String message;
  final String? recoveryHint;

  @override
  String toString() => message;
}

final class NetworkException extends AppException {
  const NetworkException({
    super.message = 'Walang internet connection.',
    super.recoveryHint = 'Suriin ang WiFi o mobile data, tapos subukan ulit.',
  });
}

final class SyncException extends AppException {
  const SyncException({
    super.message = 'Hindi ma-sync ang datos.',
    super.recoveryHint = 'Naka-save pa rin sa phone. Subukan ulit mamaya.',
  });
}

final class AuthException extends AppException {
  const AuthException({
    required super.message,
    super.recoveryHint,
  });
}

final class DatabaseException extends AppException {
  const DatabaseException({
    super.message = 'May problema sa local database.',
    super.recoveryHint =
        'Subukan i-restart ang app. Kung tuloy pa, i-restore mula sa backup.',
  });
}

final class ValidationException extends AppException {
  const ValidationException({
    required super.message,
    super.recoveryHint,
  });
}

final class PermissionException extends AppException {
  const PermissionException({
    super.message = 'Walang pahintulot para sa aksyong ito.',
    super.recoveryHint = 'Makipag-ugnayan sa may-ari ng tindahan.',
  });
}
