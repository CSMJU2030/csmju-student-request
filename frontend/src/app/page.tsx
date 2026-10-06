import Link from 'next/link';
import {
  DescriptionIcon,
  PageHeader,
  cardClass,
  primaryButtonClass,
} from '@/csmju';
import { api } from '@/lib/api';

type Service = {
  id: string;
  code: string;
  title: string;
  description: string;
  lastVerifiedAt: string | null;
  updatedAt: string;
};

type ApiResponse = {
  success: true;
  data: Service[];
  meta: {
    count: number;
  };
};

async function getServices(): Promise<Service[]> {
  const result = await api<ApiResponse>('/api/v1/services');
  return result.data;
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        title="Student Request"
        description="คู่มือการเตรียมและดำเนินคำร้องสำหรับนักศึกษา เลือกหัวข้อที่ต้องการเพื่อดูเอกสาร ขั้นตอน แบบฟอร์ม และช่องทางดำเนินการอย่างเป็นทางการ"
      />

      {services.length === 0 ? (
        <div className={`${cardClass} px-6 py-12 text-center`}>
          <DescriptionIcon className="mx-auto mb-3 h-10 w-10 text-outline" />

          <p className="text-body-md font-semibold text-on-surface">
            ยังไม่มีข้อมูลคำร้อง
          </p>

          <p className="mt-1 text-body-md text-on-surface-variant">
            ขณะนี้ยังไม่มีข้อมูลคำร้องที่พร้อมแสดง
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className={`${cardClass} flex flex-col p-6`}
            >
              <div className="text-label-sm text-primary">
                {service.code}
              </div>

              <h2 className="mt-2 text-headline-md text-on-surface">
                {service.title}
              </h2>

              <p className="mt-3 flex-1 text-body-md text-on-surface-variant">
                {service.description}
              </p>

              <Link
                href={`/services/${service.id}`}
                className={`${primaryButtonClass} mt-6`}
              >
                ดูรายละเอียด
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
