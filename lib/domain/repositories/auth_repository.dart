import 'package:lista_pay/core/rbac/user_role.dart';

abstract class AuthRepository {
  Future<void> signInWithEmail(String email, String password);
  Future<void> signInWithPin(String pin);
  Future<bool> signInWithBiometric();
  Future<void> signOut();
  Future<void> sendPasswordReset(String email);
  Future<String?> get currentUserId;
  Future<UserRole?> get currentUserRole;
  Future<bool> get isAuthenticated;
}
