import { describe, it, expect, beforeEach } from 'vitest';
import { getAccessToken, setAccessToken, clearTokens } from '@/app/auth/auth-storage';

describe('auth-storage', () => {
  beforeEach(() => {
    clearTokens();
  });

  it('returns null initially', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('stores and retrieves access token', () => {
    setAccessToken('my-jwt-token');
    expect(getAccessToken()).toBe('my-jwt-token');
  });

  it('overwrites previous token on set', () => {
    setAccessToken('first-token');
    setAccessToken('second-token');
    expect(getAccessToken()).toBe('second-token');
  });

  it('clears token', () => {
    setAccessToken('token-to-clear');
    clearTokens();
    expect(getAccessToken()).toBeNull();
  });
});
