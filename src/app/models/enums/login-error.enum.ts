/**
 * Login error codes from Supabase authentication
 */
export enum LoginError {
  InvalidCredentials = 'invalid_credentials'
}

/**
 * Human-readable login error messages for UI (Spanish)
 */
export enum LoginErrorMessage {
  InvalidCredentials = 'Credenciales inválidas.',
  Unknown = 'Error al iniciar sesión.'
}

/**
 * Maps Supabase error code to Spanish display message.
 * Returns LoginErrorMessage.Unknown for unrecognized error codes.
 */
export function getLoginErrorMessage(errorCode: string | undefined): LoginErrorMessage {
  switch (errorCode) {
    case LoginError.InvalidCredentials:
      return LoginErrorMessage.InvalidCredentials;
    default:
      return LoginErrorMessage.Unknown;
  }
}
