/** Roles used inside CSMJU Student Request. */
export enum SubsystemRole {
  USER = 'USER',
  STAFF = 'STAFF',
}

/**
 * Verified identity attached to a request.
 * Identity fields originate from a verified Core Hub JWT.
 */
export interface CoreHubIdentity {
  id: string;
  email: string;
  coreRole: string;
  sessionId?: string;
  subsystemRole: SubsystemRole;
  exp?: number;
}

export interface CoreHubTokenPayload {
  sub: string;
  email?: string;
  role?: string;
  sid?: string;
  iss: string;
  aud: string | string[];
  iat?: number;
  exp?: number;
  azp?: string;
}