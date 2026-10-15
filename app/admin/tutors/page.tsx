import { requireAdmin } from '../../../src/lib/auth';
import { User, Package, ClassSchedule, LiveClass } from '../../../src/db/models';
import TutorsAndSchedulesManager from '../../../src/components/admin/TutorsAndSchedulesManager';

export const revalidate = 0;

export default async function AdminTutorsPage() {
  await requireAdmin();

  // 1. Fetch Tutors with their assigned packages
  const tutorsData = await User.findAll({
    where: { role: 'TUTOR' },
    include: [
      {
        model: Package,
        as: 'assignedPackages',
        attributes: ['id', 'title', 'category', 'slug', 'totalClasses'],
        through: { attributes: [] },
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  // 2. Fetch all packages
  const packagesData = await Package.findAll({
    attributes: ['id', 'title', 'category', 'slug', 'totalClasses'],
    order: [['title', 'ASC']],
  });

  // 3. Fetch recurring class schedules
  const schedulesData = await ClassSchedule.findAll({
    include: [
      { model: Package, as: 'package', attributes: ['id', 'title', 'slug'] },
      { model: User, as: 'tutor', attributes: ['id', 'name', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  // 4. Fetch upcoming and scheduled live classes
  const liveClassesData = await LiveClass.findAll({
    include: [
      { model: Package, as: 'Package', attributes: ['id', 'title', 'slug'] },
      { model: User, as: 'tutor', attributes: ['id', 'name', 'email'] },
    ],
    order: [['startTime', 'ASC']],
    limit: 100,
  });

  const tutors = tutorsData.map((t) => t.toJSON());
  const packages = packagesData.map((p) => p.toJSON());
  const schedules = schedulesData.map((s) => {
    const json = s.toJSON() as any;
    return {
      ...json,
      package: json.package || json.Package,
    };
  });
  const liveClasses = liveClassesData.map((l) => {
    const json = l.toJSON() as any;
    return {
      ...json,
      package: json.Package || json.package,
    };
  });

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Tutor Management & Class Scheduling
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Add tutors, assign packages (Web Development, Video Editing, etc.), set recurring day schedules, and provide class meet links.
          </p>
        </div>
      </div>

      <TutorsAndSchedulesManager
        initialTutors={tutors as any}
        packages={packages as any}
        initialSchedules={schedules as any}
        initialLiveClasses={liveClasses as any}
      />
    </div>
  );
}
