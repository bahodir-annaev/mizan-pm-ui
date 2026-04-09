import { describe, it, expect } from 'vitest';
import { API_BASE_URL, WS_URL } from '../config';

describe('config', () => {
  it('exports API_BASE_URL as a string', () => {
    expect(typeof API_BASE_URL).toBe('string');
    expect(API_BASE_URL.length).toBeGreaterThan(0);
  });

  it('exports WS_URL as a string', () => {
    expect(typeof WS_URL).toBe('string');
    expect(WS_URL.length).toBeGreaterThan(0);
  });

  it('API_BASE_URL falls back to localhost when env var absent', () => {
    // In test environment VITE_API_URL is not set, so falls back to default
    expect(API_BASE_URL).toContain('localhost');
  });
});
