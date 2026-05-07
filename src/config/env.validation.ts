const REQUIRED_ENV_VARS = ['DB_PATH', 'GOOGLE_API_KEY'] as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Set them in your shell or copy .env.example to .env.',
    );
  }
}
