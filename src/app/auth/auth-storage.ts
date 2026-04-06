// Access token stored in memory (not localStorage) for XSS safety.
// Refresh token is an httpOnly cookie managed by the backend.

let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setAccessToken(token: string): void {
  _accessToken = token;
}

export function clearTokens(): void {
  _accessToken = null;
}
