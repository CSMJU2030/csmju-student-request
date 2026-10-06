import Link from 'next/link';
import {
  AddIcon,
  DescriptionIcon,
  EditIcon,
  PageHeader,
  cardClass,
  iconButtonClass,
  primaryButtonClass,
} from '@/csmju';
import { api } from '@/lib/api';
import DeleteServiceButton from './DeleteServiceButton';

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

export default async function StaffServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        title="จัดการบริการ"
        description="เพิ่ม แก้ไข หรือนำบริการที่ไม่ใช้งานออกจากรายการ"
      />

      <div className="mb-6 flex justify-end">
        <Link
          href="/staff/services/new"
          className={primaryButtonClass}
        >
          <AddIcon className="h-4 w-4" />
          เพิ่มบริการ
        </Link>
      </div>

      {services.length === 0 ? (
        <div className={`${cardClass} px-6 py-12 text-center`}>
          <DescriptionIcon className="mx-auto mb-3 h-10 w-10 text-outline" />

          <p className="text-body-md font-semibold text-on-surface">
            ยังไม่มีบริการ
          </p>

          <p className="mt-1 text-body-md text-on-surface-variant">
            เริ่มต้นด้วยการเพิ่มบริการแรกของระบบ
          </p>

          <Link
            href="/staff/services/new"
            className={`${primaryButtonClass} mx-auto mt-6 inline-flex`}
          >
            <AddIcon className="h-4 w-4" />
            เพิ่มบริการ
          </Link>
        </div>
      ) : (
        <div className={cardClass}>
          <div className="divide-y divide-outline-variant/40">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between gap-4 px-6 py-5"
              >
                <div className="min-w-0">
                  <p className="text-label-sm text-primary">
                    {service.code}
                  </p>

                  <h2 className="mt-1 text-body-md font-semibold text-on-surface">
                    {service.title}
                  </h2>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/staff/services/${service.id}`}
                    className={iconButtonClass}
                    aria-label={`แก้ไข ${service.title}`}
                  >
                    <EditIcon className="h-5 w-5" />
                  </Link>

                  <DeleteServiceButton
                    id={service.id}
                    title={service.title}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
