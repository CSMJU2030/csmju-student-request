import { headers } from 'next/headers';

const backend =
  process.env.BACKEND_URL ?? 'http://127.0.0.1:4234';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T>(path: string): Promise<T> {
  const requestHeaders = await headers();

  const response = await fetch(`${backend}${path}`, {
    headers: {
      cookie: requestHeaders.get('cookie') ?? '',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      'ไม่สามารถโหลดข้อมูลได้',
    );
  }

  return response.json() as Promise<T>;
}
