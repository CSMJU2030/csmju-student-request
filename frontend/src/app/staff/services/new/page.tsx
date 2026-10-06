import { PageHeader } from '@/csmju';
import { ServiceForm } from '@/components/staff/ServiceForm';

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="เพิ่มบริการ"
        description="เพิ่มข้อมูลบริการสำหรับนักศึกษา"
      />

      <ServiceForm />
    </div>
  );
}
