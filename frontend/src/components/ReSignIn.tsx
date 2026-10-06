'use client';

import { useEffect, useRef, useState } from 'react';
import { primaryButtonClass } from '@/csmju';
import { loginHref } from '@/lib/sign-in';

const RENEWED_AT_KEY = 'csmju-sso-renewed-at';
const LOOP_GUARD_MS = 30_000;

function renewedAt(): number | null {
  try {
    const value = Number(
      window.sessionStorage.getItem(RENEWED_AT_KEY),
    );

    return Number.isFinite(value) ? value : 0;
  } catch {
    return null;
  }
}

function markRenewal(): boolean {
  try {
    window.sessionStorage.setItem(
      RENEWED_AT_KEY,
      String(Date.now()),
    );
    return true;
  } catch {
    return false;
  }
}

export function ReSignIn({
  next,
  ask = false,
}: {
  next?: string;
  ask?: boolean;
}) {
  const [asking, setAsking] = useState(ask);
  const [href, setHref] = useState(loginHref(next ?? '/'));
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;

    started.current = true;

    const target = loginHref(
      next ??
        `${window.location.pathname}${window.location.search}`,
    );

    setHref(target);

    if (ask) return;

    const last = renewedAt();

    if (
      last === null ||
      Date.now() - last < LOOP_GUARD_MS ||
      !markRenewal()
    ) {
      queueMicrotask(() => {
        setAsking(true);
      });
      return;
    }

    window.location.assign(target);
  }, [ask, next]);

  return (
    <section className="border border-outline-variant bg-surface p-6">
      {asking ? (
        <>
          <h1 className="text-title-lg font-semibold">
            เข้าสู่ระบบอีกครั้ง
          </h1>

          <p className="mt-3 text-body-md text-on-surface-variant">
            {ask
              ? 'การเข้าสู่ระบบหมดอายุก่อนส่งข้อมูล — เข้าสู่ระบบอีกครั้ง แล้วส่งใหม่'
              : 'ต่ออายุการเข้าสู่ระบบไม่สำเร็จ กรุณาเข้าสู่ระบบอีกครั้ง'}
          </p>

          <a
            className={`${primaryButtonClass} mt-5 inline-flex`}
            href={href}
            onClick={() => markRenewal()}
          >
            เข้าสู่ระบบอีกครั้ง
          </a>
        </>
      ) : (
        <>
          <h1 className="text-title-lg font-semibold">
            กำลังต่ออายุการเข้าสู่ระบบ…
          </h1>

          <p className="mt-3 text-body-md text-on-surface-variant">
            กำลังผ่าน CSMJU Core Hub แล้วกลับมาที่หน้านี้
          </p>

          <noscript>
            <p className="mt-5">
              <a className={primaryButtonClass} href={href}>
                เข้าสู่ระบบอีกครั้ง
              </a>
            </p>
          </noscript>
        </>
      )}
    </section>
  );
}
