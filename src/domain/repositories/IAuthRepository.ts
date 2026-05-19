import type { User } from "@domain/entities";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

export interface IAuthRepository {
  getCurrentSession(): Promise<AuthSession | null>;
  signInWithPassword(email: string, password: string): Promise<AuthSession>;
  signUpWithPassword(
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthSession>;
  signOut(): Promise<void>;
  onAuthStateChange(
    callback: (session: AuthSession | null) => void,
  ): () => void;
}
