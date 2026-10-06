/**
 * เริ่ม sign-in ผ่าน GET /auth/login ของ subsystem นี้
 * backend จะสร้าง state แล้ว redirect ไป Core Hub
 */
export function loginHref(next: string): string {
  return `/auth/login?next=${encodeURIComponent(next)}`;
}

/**
 * รับเฉพาะ path ภายใน subsystem
 */
export function sameSitePath(value: unknown): string {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\')
    ? value
    : '/';
}
