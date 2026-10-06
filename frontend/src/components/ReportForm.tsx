'use client';

import { FormEvent, useState } from 'react';
import { inputClass, primaryButtonClass } from '@/csmju';
import { ReSignIn } from '@/components/ReSignIn';

export function ReportForm({ serviceId }: { serviceId: string }) {
  const [message, setMessage] = useState('');
  const [state, setState] = useState('');
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitting(true);
    setState('กำลังส่ง...');

    try {
      const response = await fetch(
        `/api/v1/services/${serviceId}/reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        },
      );

      if (response.status === 401) {
        setNeedsSignIn(true);
        setState('');
        return;
      }

      if (!response.ok) {
        setState('ส่งรายงานไม่สำเร็จ กรุณาลองใหม่');
        return;
      }

      setMessage('');
      setNeedsSignIn(false);
      setState('ส่งรายงานแล้ว ขอบคุณสำหรับข้อมูล');
    } catch {
      setState(
        'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-body-sm text-on-surface-variant">
        ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก
      </p>

      <form onSubmit={submit} className="space-y-3">
        <label
          className="block text-label-md font-semibold"
          htmlFor="message"
        >
          พบลิงก์หรือข้อมูลที่อาจล้าสมัย?{' '}
          <span aria-hidden="true">*</span>
        </label>

        <textarea
          id="message"
          name="message"
          required
          aria-required="true"
          minLength={5}
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} min-h-24`}
          placeholder="บอกจุดที่ควรตรวจสอบ โดยไม่ใส่ข้อมูลส่วนบุคคลหรือเอกสารนักศึกษา"
        />

        <div className="flex items-center gap-3">
          <button
            className={primaryButtonClass}
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'กำลังส่ง...' : 'รายงานข้อมูล'}
          </button>

          <span
            className="text-label-sm text-on-surface-variant"
            aria-live="polite"
          >
            {state}
          </span>
        </div>
      </form>

      {needsSignIn ? <ReSignIn ask /> : null}
    </div>
  );
}
