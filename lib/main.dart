import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lista_pay/app.dart';
import 'package:lista_pay/data/services/background_sync_service.dart';
import 'package:lista_pay/firebase_options.dart';
import 'package:workmanager/workmanager.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await Workmanager().initialize(callbackDispatcher);
  await BackgroundSyncService.registerPeriodicSync();

  runApp(
    const ProviderScope(
      child: ListaPayApp(),
    ),
  );
}
