import { Metadata } from 'next';
import { getSeoMetadata } from '../../src/lib/seo';
import PageSeoScripts from '../../src/components/common/PageSeoScripts';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/forgot-password', {
    title: 'Forgot Password | Flymedia Technology LMS',
    description: 'Reset your Flymedia Technology LMS account password securely.',
  });
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageSeoScripts path="/forgot-password" />
      {children}
    </>
  );
}
