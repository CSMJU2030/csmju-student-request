import Link from 'next/link';
import {
  cardClass,
  secondaryButtonClass,
} from '@/csmju';
import { ReSignIn } from '@/components/ReSignIn';
import { ApiError, api } from '@/lib/api';

type MeResponse = {
  success: true;
  data: {
    id: string;
    email: string;
    coreRole: string;
    subsystemRole: 'USER' | 'STAFF';
    session: {
      expiresAt: string | null;
    };
  };
};

async function getMe(): Promise<MeResponse['data'] | null> {
  try {
    const result = await api<MeResponse>('/api/v1/me');
    return result.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getMe();

  if (!me) {
    return <ReSignIn />;
  }

  if (me.subsystemRole !== 'STAFF') {
    return (
      <section className={`${cardClass} px-6 py-12 text-center sm:px-8`}>
        <h1 className="font-display text-headline-md text-on-surface">
          ไม่มีสิทธิ์
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-body-md text-on-surface-variant">
          คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ หากคิดว่าเป็นข้อผิดพลาด
          กรุณาติดต่อผู้ดูแลระบบย่อยนี้
        </p>

        <Link
          href="/"
          className={`${secondaryButtonClass} mt-6 inline-flex`}
        >
          กลับหน้าหลัก
        </Link>
      </section>
    );
  }

  return children;
}
