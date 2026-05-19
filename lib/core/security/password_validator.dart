import 'package:lista_pay/core/constants/app_constants.dart';
import 'package:lista_pay/core/errors/app_exception.dart';

/// Strong password rules for Firebase email/password accounts.
abstract final class PasswordValidator {
  static void validate(String password) {
    if (password.length < AppConstants.minPasswordLength) {
      throw ValidationException(
        message:
            'Ang password ay dapat hindi bababa sa ${AppConstants.minPasswordLength} characters.',
      );
    }
    if (!RegExp(r'[A-Z]').hasMatch(password)) {
      throw const ValidationException(
        message: 'Maglagay ng malaking titik (A-Z) sa password.',
      );
    }
    if (!RegExp(r'[a-z]').hasMatch(password)) {
      throw const ValidationException(
        message: 'Maglagay ng maliit na titik (a-z) sa password.',
      );
    }
    if (!RegExp(r'[0-9]').hasMatch(password)) {
      throw const ValidationException(
        message: 'Maglagay ng numero sa password.',
      );
    }
  }
}
