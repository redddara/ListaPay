import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lista_pay/core/security/secure_storage_service.dart';
import 'package:lista_pay/presentation/providers/app_providers.dart';
import 'package:lista_pay/presentation/screens/app_lock_screen.dart';
import 'package:lista_pay/presentation/screens/home_screen.dart';
import 'package:lista_pay/presentation/screens/login_screen.dart';
import 'package:lista_pay/presentation/theme/app_theme.dart';

class ListaPayApp extends ConsumerStatefulWidget {
  const ListaPayApp({super.key});

  @override
  ConsumerState<ListaPayApp> createState() => _ListaPayAppState();
}

class _ListaPayAppState extends ConsumerState<ListaPayApp> with WidgetsBindingObserver {
  bool _unlocked = false;
  bool _loggedIn = false;
  bool _hideSensitive = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkAuth();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Hide sensitive data when app is minimized (requirement 10).
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      setState(() => _hideSensitive = true);
    }
    if (state == AppLifecycleState.resumed) {
      _checkSession();
    }
  }

  Future<void> _checkAuth() async {
    final auth = ref.read(authRepositoryProvider);
    final loggedIn = await auth.isAuthenticated;
    if (loggedIn) {
      final expired = await ref.read(sessionManagerProvider).isSessionExpired();
      if (expired) await auth.signOut();
    }
    final stillLoggedIn = await auth.isAuthenticated;
    setState(() => _loggedIn = stillLoggedIn);
  }

  Future<void> _checkSession() async {
    final storage = ref.read(secureStorageProvider);
    if (await storage.isAppLockEnabled()) {
      setState(() {
        _unlocked = false;
        _hideSensitive = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final dbInit = ref.watch(databaseInitProvider);

    return MaterialApp(
      title: 'ListaPay',
      theme: AppTheme.light,
      debugShowCheckedModeBanner: false,
      home: dbInit.when(
        loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
        error: (e, _) => Scaffold(
          body: Center(child: Text('Database error: $e', textAlign: TextAlign.center)),
        ),
        data: (_) => _buildRoot(),
      ),
    );
  }

  Widget _buildRoot() {
    if (_hideSensitive && !_unlocked) {
      return const Scaffold(
        body: Center(child: Icon(Icons.lock, size: 64)),
      );
    }

    if (!_loggedIn) {
      return LoginScreen(onLoggedIn: () => setState(() => _loggedIn = true));
    }

    return FutureBuilder<bool>(
      future: ref.read(secureStorageProvider).isAppLockEnabled(),
      builder: (context, snapshot) {
        final lockEnabled = snapshot.data ?? false;
        if (lockEnabled && !_unlocked) {
          return AppLockScreen(onUnlocked: () => setState(() => _unlocked = true));
        }
        return const HomeScreen();
      },
    );
  }
}
