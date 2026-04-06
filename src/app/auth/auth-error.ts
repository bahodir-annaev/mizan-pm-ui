export class AuthError extends Error {
  constructor(
    public override message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
