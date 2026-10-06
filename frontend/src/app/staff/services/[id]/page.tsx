import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowBackIcon,
  PageHeader,
} from '@/csmju';
import {
  ServiceForm,
  type ServiceFormData,
} from '@/components/staff/ServiceForm';
import { ApiError, api } from '@/lib/api';

type ApiResponse = {
  success: true;
  data: ServiceFormData;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getService(id: string): Promise<ServiceFormData> {
  try {
    const result = await api<ApiResponse>(
      `/api/v1/services/${id}`,
    );

    return result.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

export default async function EditServicePage({
  params,
}: PageProps) {
  const { id } = await params;
  const service = await getService(id);

  return (
    <div className="space-y-6">
      <Link
        href="/staff/services"
        className="inline-flex items-center gap-1.5 text-label-md text-primary-container hover:underline"
      >
        <ArrowBackIcon className="h-4 w-4" />
        กลับไปหน้าจัดการบริการ
      </Link>

      <PageHeader
        title="แก้ไขบริการ"
        description={`${service.code} — ${service.title}`}
      />

      <ServiceForm initialData={service} />
    </div>
  );
}
