import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:lista_pay/core/errors/app_exception.dart';
import 'package:lista_pay/core/rbac/user_role.dart';
import 'package:lista_pay/core/security/biometric_service.dart';
import 'package:lista_pay/core/security/password_validator.dart';
import 'package:lista_pay/core/security/pin_service.dart';
import 'package:lista_pay/core/security/session_manager.dart';
import 'package:lista_pay/domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(
    this._firebaseAuth,
    this._firestore,
    this._pinService,
    this._biometricService,
    this._sessionManager,
  );

  final FirebaseAuth _firebaseAuth;
  final FirebaseFirestore _firestore;
  final PinService _pinService;
  final BiometricService _biometricService;
  final SessionManager _sessionManager;

  @override
  Future<String?> get currentUserId async => _firebaseAuth.currentUser?.uid;

  @override
  Future<bool> get isAuthenticated async => _firebaseAuth.currentUser != null;

  @override
  Future<UserRole?> get currentUserRole async {
    final uid = await currentUserId;
    if (uid == null) return null;
    final doc = await _firestore.collection('users').doc(uid).get();
    if (!doc.exists) return null;
    return UserRole.fromString(doc.data()?['role'] as String? ?? 'cashier');
  }

  @override
  Future<void> signInWithEmail(String email, String password) async {
    PasswordValidator.validate(password);
    try {
      await _firebaseAuth.signInWithEmailAndPassword(email: email, password: password);
      await _sessionManager.recordActivity();
    } on FirebaseAuthException catch (e) {
      throw AuthException(message: e.message ?? 'Hindi makapag-login.');
    }
  }

  @override
  Future<void> signInWithPin(String pin) async {
    final valid = await _pinService.verifyPin(pin);
    if (!valid) {
      throw const AuthException(message: 'Maling PIN.');
    }
    if (_firebaseAuth.currentUser == null) {
      throw const AuthException(
        message: 'Mag-login muna gamit ang email bago gumamit ng PIN.',
      );
    }
    await _sessionManager.recordActivity();
  }

  @override
  Future<bool> signInWithBiometric() async {
    final ok = await _biometricService.authenticate();
    if (ok) await _sessionManager.recordActivity();
    return ok;
  }

  @override
  Future<void> signOut() async {
    await _sessionManager.endSession();
    await _firebaseAuth.signOut();
  }

  @override
  Future<void> sendPasswordReset(String email) async {
    try {
      await _firebaseAuth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      throw AuthException(message: e.message ?? 'Hindi ma-send ang reset link.');
    }
  }
}
