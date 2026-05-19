import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// High-contrast, large-type theme for elderly sari-sari store owners.
abstract final class AppTheme {
  static const Color primaryGreen = Color(0xFF1B5E20);
  static const Color accentOrange = Color(0xFFE65100);
  static const Color background = Color(0xFFFAFAFA);
  static const Color surface = Colors.white;
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF424242);
  static const Color errorRed = Color(0xFFB71C1C);

  static ThemeData get light {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: primaryGreen,
        secondary: accentOrange,
        surface: surface,
        error: errorRed,
      ),
      scaffoldBackgroundColor: background,
    );

    final textTheme = GoogleFonts.notoSansTextTheme(base.textTheme).copyWith(
      displayLarge: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: textPrimary),
      headlineMedium: const TextStyle(fontSize: 26, fontWeight: FontWeight.w600, color: textPrimary),
      titleLarge: const TextStyle(fontSize: 22, fontWeight: FontWeight.w600, color: textPrimary),
      bodyLarge: const TextStyle(fontSize: 20, color: textPrimary, height: 1.4),
      bodyMedium: const TextStyle(fontSize: 18, color: textSecondary, height: 1.4),
      labelLarge: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
    );

    return base.copyWith(
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        titleTextStyle: textTheme.titleLarge?.copyWith(color: Colors.white),
        centerTitle: true,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
          textStyle: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(double.infinity, 56),
          textStyle: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          side: const BorderSide(color: primaryGreen, width: 2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        labelStyle: const TextStyle(fontSize: 18),
        hintStyle: const TextStyle(fontSize: 18, color: textSecondary),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
      snackBarTheme: const SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        contentTextStyle: TextStyle(fontSize: 18),
      ),
      dialogTheme: DialogThemeData(
        titleTextStyle: textTheme.titleLarge,
        contentTextStyle: textTheme.bodyLarge,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }
}
