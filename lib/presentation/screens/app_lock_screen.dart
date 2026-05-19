import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lista_pay/core/constants/app_constants.dart';
import 'package:lista_pay/presentation/providers/app_providers.dart';

/// PIN / biometric gate on startup and after session timeout.
class AppLockScreen extends ConsumerStatefulWidget {
  const AppLockScreen({super.key, required this.onUnlocked});

  final VoidCallback onUnlocked;

  @override
  ConsumerState<AppLockScreen> createState() => _AppLockScreenState();
}

class _AppLockScreenState extends ConsumerState<AppLockScreen> {
  final _pinController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tryBiometric();
  }

  Future<void> _tryBiometric() async {
    final storage = ref.read(secureStorageProvider);
    if (!await storage.isBiometricEnabled()) return;
    final bio = ref.read(biometricServiceProvider);
    final auth = ref.read(authRepositoryProvider);
    if (await bio.authenticate()) {
      await auth.signInWithBiometric();
      widget.onUnlocked();
    }
  }

  Future<void> _submitPin() async {
    final pin = _pinController.text;
    if (pin.length != AppConstants.pinLength) return;
    final pinService = ref.read(pinServiceProvider);
    final valid = await pinService.verifyPin(pin);
    if (!valid || !mounted) return;
    await ref.read(sessionManagerProvider).recordActivity();
    widget.onUnlocked();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.lock_outline, size: 72, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 24),
              Text('Ilagay ang PIN', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 32),
              TextField(
                controller: _pinController,
                keyboardType: TextInputType.number,
                obscureText: true,
                maxLength: AppConstants.pinLength,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 28, letterSpacing: 8),
                decoration: const InputDecoration(counterText: ''),
                onSubmitted: (_) => _submitPin(),
              ),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: _submitPin, child: const Text('I-unlock')),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: _tryBiometric,
                child: const Text('Gamitin ang fingerprint'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }
}
