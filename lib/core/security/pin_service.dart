import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:lista_pay/core/constants/app_constants.dart';
import 'package:lista_pay/core/errors/app_exception.dart';
import 'package:lista_pay/core/security/secure_storage_service.dart';

/// Local PIN setup and verification (hashed, never stored in plain text).
class PinService {
  PinService(this._secureStorage);

  final SecureStorageService _secureStorage;

  String _hashPin(String pin, String salt) {
    final bytes = utf8.encode('$pin$salt');
    return sha256.convert(bytes).toString();
  }

  Future<void> setPin(String pin) async {
    _validatePinFormat(pin);
    final salt = DateTime.now().microsecondsSinceEpoch.toString();
    final hash = _hashPin(pin, salt);
    await _secureStorage.setPinSalt(salt);
    await _secureStorage.setPinHash(hash);
  }

  Future<bool> verifyPin(String pin) async {
    final salt = await _secureStorage.getPinSalt();
    final storedHash = await _secureStorage.getPinHash();
    if (salt == null || storedHash == null) return false;
    return _hashPin(pin, salt) == storedHash;
  }

  Future<bool> hasPin() async =>
      (await _secureStorage.getPinHash()) != null;

  void _validatePinFormat(String pin) {
    if (pin.length != AppConstants.pinLength ||
        !RegExp(r'^\d+$').hasMatch(pin)) {
      throw const ValidationException(
        message: 'Ang PIN ay dapat ${AppConstants.pinLength} na numero.',
      );
    }
  }
}
