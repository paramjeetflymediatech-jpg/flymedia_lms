// This layout override removes the admin sidebar for the login page
// so /admin/login renders as a full-screen standalone page.
import { ReactNode } from 'react';

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
