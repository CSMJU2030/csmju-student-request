import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_Thai } from 'next/font/google';
import { CsmjuAppShell, type NavItem } from '@/csmju';
import { ReSignIn } from '@/components/ReSignIn';
import { ApiError, api } from '@/lib/api';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

const notoSansThai = Noto_Sans_Thai({
  variable: '--font-noto-thai',
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
});

const DISPLAY_NAME = 'CSMJU Student Request';

const BASE_NAV: NavItem[] = [
  {
    label: 'Student Request',
    labelEn: 'Student Request',
    href: '/',
    icon: 'description',
  },
];

const CORE_HUB_WEB_URL = process.env.CORE_HUB_WEB_URL;

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

function avatarTextFromEmail(email: string): string {
  const localPart = email.split('@')[0]?.trim();
  return localPart ? localPart.slice(0, 2).toUpperCase() : '--';
}

function navForRole(
  role: MeResponse['data']['subsystemRole'],
): NavItem[] {
  if (role !== 'STAFF') {
    return BASE_NAV;
  }

  return [
    ...BASE_NAV,
    {
      label: 'จัดการบริการ',
      labelEn: 'Manage Services',
      href: '/staff/services',
      icon: 'description',
    },
  ];
}

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

export const metadata: Metadata = {
  title: {
    template: `%s · ${DISPLAY_NAME} · CSMJU`,
    default: `${DISPLAY_NAME} · CSMJU`,
  },
};

export default async function RootLayout({
  children,
}: LayoutProps<'/'>) {
  const me = await getMe();

  return (
    <html
      lang="th"
      className={`${jakarta.variable} ${notoSansThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-surface">
        {me ? (
          <CsmjuAppShell
            displayName={DISPLAY_NAME}
            nav={navForRole(me.subsystemRole)}
            user={{
              initials: avatarTextFromEmail(me.email),
              roleLabel: me.subsystemRole,
            }}
            coreHubUrl={CORE_HUB_WEB_URL}
          >
            {children}
          </CsmjuAppShell>
        ) : (
          <main className="mx-auto w-full max-w-3xl p-6">
            <ReSignIn />
          </main>
        )}
      </body>
    </html>
  );
}
