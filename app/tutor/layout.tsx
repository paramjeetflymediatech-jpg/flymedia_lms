import { ReactNode } from 'react';
import { requireTutor } from '../../src/lib/auth';
import { User } from '../../src/db/models';
import TutorLayoutClient from './TutorLayoutClient';

export default async function TutorLayout({ children }: { children: ReactNode }) {
  const sessionUser = await requireTutor();

  // Fetch fresh user data so the avatar/name is up to date in the layout header
  const dbUser = await User.findByPk(sessionUser.id);

  const userProps = {
    name: dbUser?.name || sessionUser.name,
    avatar: dbUser?.avatar || null,
  };

  return (
    <TutorLayoutClient user={userProps}>
      {children}
    </TutorLayoutClient>
  );
}
