'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  cardClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/csmju';
import { ReSignIn } from '@/components/ReSignIn';

type ServiceInputItem = {
  label: string;
  description: string;
  isRequired: boolean;
};

type ServiceDocumentItem = {
  name: string;
  description: string;
  isRequired: boolean;
};

type ServiceStepItem = {
  stepNo: number;
  title: string;
  description: string;
  requiresSignature: boolean;
  location: string;
};

type LinkType =
  | 'FORM'
  | 'OFFICIAL_SYSTEM'
  | 'INFORMATION'
  | 'DOWNLOAD';

type ServiceLinkItem = {
  title: string;
  url: string;
  linkType: LinkType;
};

type ServiceContactItem = {
  name: string;
  channel: string;
  value: string;
};

export type ServiceFormData = {
  id: string;
  code: string;
  title: string;
  description: string;
  lastVerifiedAt: string | null;
  inputs: Array<{
    label: string;
    description: string | null;
    isRequired: boolean;
  }>;
  steps: Array<{
    stepNo: number;
    title: string;
    description: string;
    requiresSignature: boolean;
    location: string | null;
  }>;
  documents: Array<{
    name: string;
    description: string | null;
    isRequired: boolean;
  }>;
  links: Array<{
    title: string;
    url: string;
    linkType: LinkType;
  }>;
  contacts: Array<{
    name: string;
    channel: string;
    value: string;
  }>;
};

type ServiceFormProps = {
  initialData?: ServiceFormData;
};

export function ServiceForm({ initialData }: ServiceFormProps) {
  const router = useRouter();
  const [state, setState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const [inputs, setInputs] = useState<ServiceInputItem[]>(
    () =>
      initialData?.inputs.map((input) => ({
        label: input.label,
        description: input.description ?? '',
        isRequired: input.isRequired,
      })) ?? [],
  );

  const [documents, setDocuments] = useState<ServiceDocumentItem[]>(
    () =>
      initialData?.documents.map((document) => ({
        name: document.name,
        description: document.description ?? '',
        isRequired: document.isRequired,
      })) ?? [],
  );

  const [steps, setSteps] = useState<ServiceStepItem[]>(
    () =>
      initialData?.steps.map((step) => ({
        stepNo: step.stepNo,
        title: step.title,
        description: step.description,
        requiresSignature: step.requiresSignature,
        location: step.location ?? '',
      })) ?? [],
  );

  const [links, setLinks] = useState<ServiceLinkItem[]>(
    () => initialData?.links.map((link) => ({ ...link })) ?? [],
  );

  const [contacts, setContacts] = useState<ServiceContactItem[]>(
    () => initialData?.contacts.map((contact) => ({ ...contact })) ?? [],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const form = new FormData(event.currentTarget);

    const code = String(form.get('code') ?? '').trim();
    const title = String(form.get('title') ?? '').trim();
    const description = String(form.get('description') ?? '').trim();
    const lastVerifiedAt = String(
      form.get('lastVerifiedAt') ?? '',
    ).trim();

    setSubmitting(true);
    setState('กำลังบันทึก...');

    try {
      const response = await fetch(
        initialData
          ? `/api/v1/services/${initialData.id}`
          : '/api/v1/services',
        {
        method: initialData ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          title,
          description,
          ...(lastVerifiedAt
            ? { lastVerifiedAt: new Date(lastVerifiedAt).toISOString() }
            : {}),
          inputs: inputs.map((input) => ({
            label: input.label.trim(),
            ...(input.description.trim()
              ? { description: input.description.trim() }
              : {}),
            isRequired: input.isRequired,
          })),
          steps: steps.map((step) => ({
            stepNo: step.stepNo,
            title: step.title.trim(),
            description: step.description.trim(),
            requiresSignature: step.requiresSignature,
            ...(step.location.trim()
              ? { location: step.location.trim() }
              : {}),
          })),
          documents: documents.map((document) => ({
            name: document.name.trim(),
            ...(document.description.trim()
              ? { description: document.description.trim() }
              : {}),
            isRequired: document.isRequired,
          })),
          links: links.map((link) => ({
            title: link.title.trim(),
            url: link.url.trim(),
            linkType: link.linkType,
          })),
          contacts: contacts.map((contact) => ({
            name: contact.name.trim(),
            channel: contact.channel.trim(),
            value: contact.value.trim(),
          })),
        }),
        },
      );

      if (response.status === 401) {
        setNeedsSignIn(true);
        setState('');
        return;
      }

      if (response.status === 403) {
        setState(
          initialData
            ? 'บัญชีนี้ไม่มีสิทธิ์แก้ไขบริการ'
            : 'บัญชีนี้ไม่มีสิทธิ์เพิ่มบริการ',
        );
        return;
      }

      if (!response.ok) {
        setState('บันทึกบริการไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองใหม่');
        return;
      }

      router.push('/staff/services');
      router.refresh();
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

      <form
      onSubmit={submit}
      className={`${cardClass} space-y-6 p-6`}
    >
      <div>
        <label
          htmlFor="code"
          className="block text-label-md text-on-surface"
        >
          รหัสบริการ <span aria-hidden="true">*</span>
        </label>

        <input
          id="code"
          name="code"
          required
          aria-required="true"
          maxLength={64}
          pattern="[A-Z0-9_]+"
          className={`${inputClass} mt-2`}
          placeholder="เช่น LEAVE"
          defaultValue={initialData?.code ?? ''}
        />

        <p className="mt-1 text-caption text-secondary">
          ใช้ตัวอักษร A-Z ตัวเลข และ _ เท่านั้น
        </p>
      </div>

      <div>
        <label
          htmlFor="title"
          className="block text-label-md text-on-surface"
        >
          ชื่อบริการ <span aria-hidden="true">*</span>
        </label>

        <input
          id="title"
          name="title"
          required
          aria-required="true"
          maxLength={255}
          className={`${inputClass} mt-2`}
          defaultValue={initialData?.title ?? ''}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-label-md text-on-surface"
        >
          รายละเอียด <span aria-hidden="true">*</span>
        </label>

        <textarea
          id="description"
          name="description"
          required
          aria-required="true"
          maxLength={10000}
          className={`${inputClass} mt-2 min-h-36`}
          defaultValue={initialData?.description ?? ''}
        />
      </div>

      <div>
        <label
          htmlFor="lastVerifiedAt"
          className="block text-label-md text-on-surface"
        >
          วันที่ตรวจสอบข้อมูลล่าสุด
        </label>

        <input
          id="lastVerifiedAt"
          name="lastVerifiedAt"
          type="date"
          className={`${inputClass} mt-2`}
          defaultValue={
            initialData?.lastVerifiedAt
              ? initialData.lastVerifiedAt.slice(0, 10)
              : ''
          }
        />
      </div>

      <section className="space-y-4 border-t border-outline-variant/40 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-headline-md text-on-surface">
              ข้อมูลที่ต้องเตรียม
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              ระบุข้อมูลที่นักศึกษาต้องเตรียมก่อนดำเนินการ
            </p>
          </div>

          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() =>
              setInputs((current) => [
                ...current,
                {
                  label: '',
                  description: '',
                  isRequired: true,
                },
              ])
            }
          >
            เพิ่มข้อมูล
          </button>
        </div>

        {inputs.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            ยังไม่มีรายการ
          </p>
        ) : (
          <div className="space-y-4">
            {inputs.map((input, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-outline-variant/40 bg-surface-container-low p-4"
              >
                <div>
                  <label className="block text-label-md text-on-surface">
                    รายการ <span aria-hidden="true">*</span>
                  </label>
                  <input
                    required
                    aria-required="true"
                    maxLength={255}
                    className={`${inputClass} mt-2`}
                    value={input.label}
                    onChange={(event) =>
                      setInputs((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface">
                    รายละเอียด
                  </label>
                  <textarea
                    maxLength={2000}
                    className={`${inputClass} mt-2 min-h-24`}
                    value={input.description}
                    onChange={(event) =>
                      setInputs((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                description: event.target.value,
                              }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={input.isRequired}
                    onChange={(event) =>
                      setInputs((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                isRequired: event.target.checked,
                              }
                            : item,
                        ),
                      )
                    }
                  />
                  จำเป็น
                </label>

                <button
                  type="button"
                  className="text-label-md text-error hover:underline"
                  onClick={() =>
                    setInputs((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  ลบรายการ
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 border-t border-outline-variant/40 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-headline-md text-on-surface">
              เอกสารที่ต้องใช้
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              ระบุเอกสารที่ใช้ประกอบบริการนี้
            </p>
          </div>

          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() =>
              setDocuments((current) => [
                ...current,
                {
                  name: '',
                  description: '',
                  isRequired: true,
                },
              ])
            }
          >
            เพิ่มเอกสาร
          </button>
        </div>

        {documents.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            ยังไม่มีรายการ
          </p>
        ) : (
          <div className="space-y-4">
            {documents.map((document, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-outline-variant/40 bg-surface-container-low p-4"
              >
                <div>
                  <label className="block text-label-md text-on-surface">
                    ชื่อเอกสาร <span aria-hidden="true">*</span>
                  </label>
                  <input
                    required
                    aria-required="true"
                    maxLength={255}
                    className={`${inputClass} mt-2`}
                    value={document.name}
                    onChange={(event) =>
                      setDocuments((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface">
                    รายละเอียด
                  </label>
                  <textarea
                    maxLength={2000}
                    className={`${inputClass} mt-2 min-h-24`}
                    value={document.description}
                    onChange={(event) =>
                      setDocuments((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                description: event.target.value,
                              }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={document.isRequired}
                    onChange={(event) =>
                      setDocuments((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                isRequired: event.target.checked,
                              }
                            : item,
                        ),
                      )
                    }
                  />
                  จำเป็น
                </label>

                <button
                  type="button"
                  className="text-label-md text-error hover:underline"
                  onClick={() =>
                    setDocuments((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  ลบเอกสาร
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 border-t border-outline-variant/40 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-headline-md text-on-surface">
              ขั้นตอนดำเนินการ
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              ระบุขั้นตอนตามลำดับที่นักศึกษาต้องดำเนินการ
            </p>
          </div>

          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() =>
              setSteps((current) => [
                ...current,
                {
                  stepNo: current.length + 1,
                  title: '',
                  description: '',
                  requiresSignature: false,
                  location: '',
                },
              ])
            }
          >
            เพิ่มขั้นตอน
          </button>
        </div>

        {steps.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            ยังไม่มีรายการ
          </p>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-outline-variant/40 bg-surface-container-low p-4"
              >
                <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                  <div>
                    <label className="block text-label-md text-on-surface">
                      ลำดับ <span aria-hidden="true">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      aria-required="true"
                      className={`${inputClass} mt-2`}
                      value={step.stepNo}
                      onChange={(event) =>
                        setSteps((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  stepNo: Number(event.target.value),
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-label-md text-on-surface">
                      ชื่อขั้นตอน <span aria-hidden="true">*</span>
                    </label>
                    <input
                      required
                      aria-required="true"
                      maxLength={255}
                      className={`${inputClass} mt-2`}
                      value={step.title}
                      onChange={(event) =>
                        setSteps((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, title: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-md text-on-surface">
                    รายละเอียด <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    required
                    aria-required="true"
                    maxLength={5000}
                    className={`${inputClass} mt-2 min-h-24`}
                    value={step.description}
                    onChange={(event) =>
                      setSteps((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                description: event.target.value,
                              }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface">
                    สถานที่
                  </label>
                  <input
                    maxLength={255}
                    className={`${inputClass} mt-2`}
                    value={step.location}
                    onChange={(event) =>
                      setSteps((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, location: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={step.requiresSignature}
                    onChange={(event) =>
                      setSteps((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                requiresSignature: event.target.checked,
                              }
                            : item,
                        ),
                      )
                    }
                  />
                  ต้องมีลายเซ็น
                </label>

                <button
                  type="button"
                  className="text-label-md text-error hover:underline"
                  onClick={() =>
                    setSteps((current) =>
                      current
                        .filter((_, itemIndex) => itemIndex !== index)
                        .map((item, itemIndex) => ({
                          ...item,
                          stepNo: itemIndex + 1,
                        })),
                    )
                  }
                >
                  ลบขั้นตอน
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 border-t border-outline-variant/40 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-headline-md text-on-surface">
              ลิงก์และช่องทางอย่างเป็นทางการ
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              เพิ่มเฉพาะลิงก์ที่มีแหล่งข้อมูลยืนยันแล้ว
            </p>
          </div>

          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() =>
              setLinks((current) => [
                ...current,
                {
                  title: '',
                  url: '',
                  linkType: 'INFORMATION',
                },
              ])
            }
          >
            เพิ่มลิงก์
          </button>
        </div>

        {links.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            ยังไม่มีรายการ
          </p>
        ) : (
          <div className="space-y-4">
            {links.map((link, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-outline-variant/40 bg-surface-container-low p-4"
              >
                <div>
                  <label className="block text-label-md text-on-surface">
                    ชื่อลิงก์ <span aria-hidden="true">*</span>
                  </label>
                  <input
                    required
                    aria-required="true"
                    maxLength={255}
                    className={`${inputClass} mt-2`}
                    value={link.title}
                    onChange={(event) =>
                      setLinks((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, title: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface">
                    URL <span aria-hidden="true">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    aria-required="true"
                    className={`${inputClass} mt-2`}
                    placeholder="https://..."
                    value={link.url}
                    onChange={(event) =>
                      setLinks((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, url: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface">
                    ประเภทลิงก์
                  </label>
                  <select
                    className={`${inputClass} mt-2`}
                    value={link.linkType}
                    onChange={(event) =>
                      setLinks((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                linkType: event.target.value as LinkType,
                              }
                            : item,
                        ),
                      )
                    }
                  >
                    <option value="FORM">แบบฟอร์ม</option>
                    <option value="OFFICIAL_SYSTEM">
                      ระบบอย่างเป็นทางการ
                    </option>
                    <option value="INFORMATION">
                      ข้อมูลเพิ่มเติม
                    </option>
                    <option value="DOWNLOAD">
                      ดาวน์โหลด
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  className="text-label-md text-error hover:underline"
                  onClick={() =>
                    setLinks((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  ลบลิงก์
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 border-t border-outline-variant/40 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-headline-md text-on-surface">
              ช่องทางติดต่อ
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              เพิ่มเมื่อมีข้อมูลติดต่อที่ยืนยันแล้ว
            </p>
          </div>

          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() =>
              setContacts((current) => [
                ...current,
                {
                  name: '',
                  channel: '',
                  value: '',
                },
              ])
            }
          >
            เพิ่มช่องทางติดต่อ
          </button>
        </div>

        {contacts.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            ยังไม่มีรายการ
          </p>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-outline-variant/40 bg-surface-container-low p-4"
              >
                <div>
                  <label className="block text-label-md text-on-surface">
                    ชื่อ <span aria-hidden="true">*</span>
                  </label>
                  <input
                    required
                    aria-required="true"
                    maxLength={255}
                    className={`${inputClass} mt-2`}
                    value={contact.name}
                    onChange={(event) =>
                      setContacts((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface">
                    ช่องทาง <span aria-hidden="true">*</span>
                  </label>
                  <input
                    required
                    aria-required="true"
                    maxLength={100}
                    className={`${inputClass} mt-2`}
                    value={contact.channel}
                    onChange={(event) =>
                      setContacts((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, channel: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface">
                    ข้อมูลติดต่อ <span aria-hidden="true">*</span>
                  </label>
                  <input
                    required
                    aria-required="true"
                    maxLength={255}
                    className={`${inputClass} mt-2`}
                    value={contact.value}
                    onChange={(event) =>
                      setContacts((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, value: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>

                <button
                  type="button"
                  className="text-label-md text-error hover:underline"
                  onClick={() =>
                    setContacts((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  ลบช่องทางติดต่อ
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className={primaryButtonClass}
        >
          {submitting
            ? 'กำลังบันทึก...'
            : initialData
              ? 'บันทึกการแก้ไข'
              : 'บันทึกบริการ'}
        </button>

        <Link
          href="/staff/services"
          className={secondaryButtonClass}
        >
          ยกเลิก
        </Link>

        <span
          className="text-body-sm text-on-surface-variant"
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
