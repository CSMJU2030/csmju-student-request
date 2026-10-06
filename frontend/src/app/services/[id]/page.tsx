import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReportForm } from '@/components/ReportForm';
import {
  ArrowBackIcon,
  cardClass,
} from '@/csmju';
import { ApiError, api } from '@/lib/api';

type ContactDirectory = {
  id: string;
  code: string;
  personCode: string | null;
  name: string | null;
  position: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
};

type ServiceStepContact = {
  id: string;
  label: string;
  personName: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  guidance: string | null;
  actionUrl: string | null;
  actionLabel: string | null;
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
  contactDirectory: ContactDirectory | null;
};

type ServiceStep = {
  id: string;
  stepNo: number;
  title: string;
  description: string;
  requiresSignature: boolean;
  location: string | null;
  contacts: ServiceStepContact[];
};

type ServiceDocument = {
  id: string;
  name: string;
  description: string | null;
  isRequired: boolean;
};

type ServiceInput = {
  id: string;
  label: string;
  description: string | null;
  isRequired: boolean;
};

type LinkType = 'FORM' | 'OFFICIAL_SYSTEM' | 'INFORMATION' | 'DOWNLOAD';

type ServiceLink = {
  id: string;
  title: string;
  url: string;
  linkType: LinkType;
};

type ServiceContact = {
  id: string;
  name: string;
  channel: string;
  value: string;
};

type Service = {
  id: string;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  inputs: ServiceInput[];
  steps: ServiceStep[];
  documents: ServiceDocument[];
  links: ServiceLink[];
  contacts: ServiceContact[];
};

type ApiResponse = {
  success: true;
  data: Service;
};

type Advisor = {
  personCode: string;
  fullNameTh: string;
  universityEmail: string | null;
};

type AdvisorsApiResponse = {
  success: true;
  data: Advisor[];
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const linkTypeLabel: Record<LinkType, string> = {
  FORM: 'แบบฟอร์ม',
  OFFICIAL_SYSTEM: 'ระบบอย่างเป็นทางการ',
  INFORMATION: 'ข้อมูลเพิ่มเติม',
  DOWNLOAD: 'ดาวน์โหลด',
};

async function getService(id: string): Promise<Service> {
  try {
    const result = await api<ApiResponse>(`/api/v1/services/${id}`);
    return result.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

async function getMyAdvisors(): Promise<Advisor[]> {
  try {
    const result = await api<AdvisorsApiResponse>('/api/v1/me/advisors');
    return result.data;
  } catch {
    // Advisor data is supplementary. The service guide and its verified
    // contact channels must remain usable if Core Hub is temporarily unavailable.
    return [];
  }
}

function formatVerifiedDate(value: string | null) {
  if (!value) return 'ยังไม่มีข้อมูลยืนยัน';

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'long',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value));
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const service = await getService(id);
  const needsAdvisor = service.steps.some((step) =>
    step.contacts.some((contact) => contact.label === 'อาจารย์ที่ปรึกษา'),
  );
  const advisors = needsAdvisor ? await getMyAdvisors() : [];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-label-md text-primary-container hover:underline"
        >
          <ArrowBackIcon className="h-4 w-4" />
          กลับไปบริการทั้งหมด
        </Link>

        <div className="mt-6 text-label-md text-primary-container">
          {service.code}
        </div>

        <h1 className="mt-2 font-display text-headline-lg text-on-surface">
          {service.title}
        </h1>

        <p className="mt-4 max-w-3xl text-body-md text-on-surface-variant">
          {service.description}
        </p>

        <p className="mt-3 text-label-sm text-secondary">
          ตรวจสอบข้อมูลล่าสุด: {formatVerifiedDate(service.lastVerifiedAt)}
        </p>
      </div>

      <section className={`${cardClass} p-6`}>
        <h2 className="font-display text-headline-md text-on-surface">
          แบบฟอร์มและช่องทางอย่างเป็นทางการ
        </h2>

        {service.links.length > 0 ? (
          <div className="mt-4 space-y-3">
            {service.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-outline-variant/40 p-4 transition-colors hover:bg-surface-variant/50"
              >
                <div className="font-medium text-on-surface">
                  {link.title}
                </div>
                <div className="mt-1 text-label-sm text-secondary">
                  {linkTypeLabel[link.linkType]}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-body-md text-on-surface-variant">
            ยังไม่มีข้อมูลยืนยันเกี่ยวกับลิงก์อย่างเป็นทางการ
          </p>
        )}
      </section>



      <section className={`${cardClass} p-6`}>
        <h2 className="font-display text-headline-md text-on-surface">
          เอกสารที่ต้องใช้
        </h2>

        {service.documents.length > 0 ? (
          <div className="mt-4 space-y-4">
            {service.documents.map((document) => (
              <div
                key={document.id}
                className="border-b border-outline-variant/40 pb-4 last:border-0"
              >
                <div className="font-medium text-on-surface">
                  {document.name}
                  {document.isRequired && (
                    <span className="ml-2 inline-flex rounded-full bg-surface-variant px-2.5 py-1 text-label-sm text-on-surface-variant">จำเป็น</span>
                  )}
                </div>

                {document.description && (
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    {document.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-body-md text-on-surface-variant">ยังไม่มีข้อมูลยืนยัน</p>
        )}
      </section>

      <section className={`${cardClass} p-6`}>
        <h2 className="font-display text-headline-md text-on-surface">
          ขั้นตอนดำเนินการ
        </h2>

        {service.steps.length > 0 ? (
          <ol className="mt-4 space-y-5">
            {service.steps.map((step) => (
              <li key={step.id} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-md text-white">
                  {step.stepNo}
                </div>

                <div>
                  <h3 className="font-semibold text-on-surface">
                    {step.title}
                  </h3>

                  <p className="mt-1 text-body-md text-on-surface-variant">
                    {step.description}
                  </p>

                  {step.requiresSignature && (
                    <p className="mt-2 text-label-md text-primary-container">
                      ต้องมีลายเซ็น
                    </p>
                  )}

                  {step.location && (
                    <p className="mt-1 text-label-sm text-secondary">
                      สถานที่: {step.location}
                    </p>
                  )}

                  {step.contacts.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {step.contacts.map((contact) => {
                        const personName =
                          contact.contactDirectory?.name ?? contact.personName;
                        const location =
                          contact.contactDirectory?.location ?? contact.location;
                        const phone =
                          contact.contactDirectory?.phone ?? contact.phone;
                        const email =
                          contact.contactDirectory?.email ?? contact.email;
                        const sourceUrl =
                          contact.contactDirectory?.sourceUrl ?? contact.sourceUrl;

                        return (
                        <div
                          key={contact.id}
                          className="rounded-lg border border-outline-variant/40 p-4"
                        >
                          <div className="font-medium text-on-surface">
                            {contact.label}
                          </div>

                          {contact.label === 'อาจารย์ที่ปรึกษา' &&
                          advisors.length > 0 ? (
                            <div className="mt-1 space-y-2">
                              {advisors.map((advisor) => (
                                <div key={advisor.personCode}>
                                  <p className="text-body-md text-on-surface">
                                    {advisor.fullNameTh}
                                  </p>

                                  {advisor.universityEmail && (
                                    <p className="mt-1 text-body-sm text-on-surface-variant">
                                      อีเมล:{' '}
                                      <a
                                        href={`mailto:${advisor.universityEmail}`}
                                        className="text-primary-container hover:underline"
                                      >
                                        {advisor.universityEmail}
                                      </a>
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            personName && (
                              <p className="mt-1 text-body-md text-on-surface">
                                {personName}
                              </p>
                            )
                          )}

                          {contact.guidance && (
                            <p className="mt-1 text-body-sm text-on-surface-variant">
                              {contact.guidance}
                            </p>
                          )}

                          {location && (
                            <p className="mt-2 text-body-sm text-on-surface-variant">
                              สถานที่ติดต่อ: {location}
                            </p>
                          )}

                          {phone && (
                            <p className="mt-1 text-body-sm text-on-surface-variant">
                              โทรศัพท์: {phone}
                            </p>
                          )}

                          {email && (
                            <p className="mt-1 text-body-sm text-on-surface-variant">
                              อีเมล:{' '}
                              <a
                                href={`mailto:${email}`}
                                className="text-primary-container hover:underline"
                              >
                                {email}
                              </a>
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-3">
                            {contact.actionUrl && (
                              <a
                                href={contact.actionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-lg border border-outline-variant px-3 py-2 text-label-md text-primary-container hover:bg-surface-variant/50"
                              >
                                {contact.actionLabel ?? 'ไปยังเว็บไซต์'}
                              </a>
                            )}

                            {sourceUrl && (
                              <a
                                href={sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-1 py-2 text-label-md text-secondary hover:underline"
                              >
                                แหล่งข้อมูลอย่างเป็นทางการ
                              </a>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-body-md text-on-surface-variant">ยังไม่มีข้อมูลยืนยัน</p>
        )}
      </section>





      <section className={`${cardClass} p-6`}>
        <ReportForm serviceId={service.id} />
      </section>
    </div>
  );
}
