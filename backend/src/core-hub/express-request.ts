/**
 * Raw user token already verified by AuthGuard.
 * Used only for allowed backend -> Core Hub requests.
 * Never log or persist this value.
 */
declare global {
  // Express request augmentation requires namespace merging.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      coreHubAccessToken?: string;
    }
  }
}

export {};
