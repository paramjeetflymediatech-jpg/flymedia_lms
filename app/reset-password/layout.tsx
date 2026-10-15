import { Metadata } from 'next';
import { getSeoMetadata } from '../../src/lib/seo';
import PageSeoScripts from '../../src/components/common/PageSeoScripts';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/reset-password', {
    title: 'Reset Password | Flymedia Technology LMS',
    description: 'Set a new password for your Flymedia Technology LMS account.',
  });
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageSeoScripts path="/reset-password" />
      {children}
    </>
  );
}
