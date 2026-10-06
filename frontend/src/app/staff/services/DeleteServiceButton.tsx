'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ConfirmDeleteModal,
  DeleteIcon,
  iconDangerButtonClass,
} from '@/csmju';
import { ReSignIn } from '@/components/ReSignIn';

export default function DeleteServiceButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (deleting) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/services/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 401) {
        setConfirming(false);
        setNeedsSignIn(true);
        return;
      }

      if (response.status === 403) {
        setConfirming(false);
        setError('คุณไม่มีสิทธิ์ลบบริการนี้');
        return;
      }

      if (response.status === 404) {
        setConfirming(false);
        setError('ไม่พบบริการที่ต้องการลบ อาจถูกลบไปแล้ว');
        router.refresh();
        return;
      }

      if (!response.ok) {
        setConfirming(false);
        setError('ลบบริการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        return;
      }

      setConfirming(false);
      router.refresh();
    } catch {
      setConfirming(false);
      setError(
        'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง',
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
        className={iconDangerButtonClass}
        aria-label={`ลบ ${title}`}
      >
        <DeleteIcon className="h-5 w-5" />
      </button>

      {confirming ? (
        <ConfirmDeleteModal
          title="ยืนยันการลบบริการ"
          message={
            <>
              ต้องการลบบริการ{' '}
              <strong className="text-on-surface">
                &quot;{title}&quot;
              </strong>
              ? บริการนี้จะไม่แสดงในรายการบริการอีก
            </>
          }
          blockedReason={deleting ? 'กำลังลบบริการ กรุณารอสักครู่' : undefined}
          onConfirm={() => void remove()}
          onClose={() => {
            if (!deleting) setConfirming(false);
          }}
        />
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-2 text-body-md text-error"
        >
          {error}
        </p>
      ) : null}

      {needsSignIn ? <ReSignIn ask /> : null}
    </>
  );
}
