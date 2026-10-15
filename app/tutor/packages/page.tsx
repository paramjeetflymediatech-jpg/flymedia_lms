import { requireAuth } from '../../../src/lib/auth';
import { redirect } from 'next/navigation';
import { User, Package, LiveClass, Enrollment, ClassSchedule } from '../../../src/db/models';
import Link from 'next/link';

export const revalidate = 0;

export default async function TutorPackagesPage() {
  const user = await requireAuth();

  if (user.role !== 'TUTOR') {
    redirect('/dashboard');
  }

  // 1. Fetch tutor with assignedPackages
  const tutorData = await User.findByPk(user.id, {
    include: [
      {
        model: Package,
        as: 'assignedPackages',
        through: { attributes: [] },
        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar'] }],
          },
          {
            model: ClassSchedule,
            as: 'schedules',
            where: { tutorId: user.id },
            required: false,
          },
          {
            model: LiveClass,
            as: 'liveClasses',
            where: { tutorId: user.id },
            required: false,
          },
        ],
      },
    ],
  });

  // 2. Also find any other packages where this tutor has live classes scheduled
  const otherClasses = await LiveClass.findAll({
    where: { tutorId: user.id },
    attributes: ['packageId'],
  });
  const otherPackageIds = [...new Set(otherClasses.map((c) => c.packageId))];

  const assignedList = (tutorData?.assignedPackages || []).map((p) => p.toJSON() as any);
  const existingAssignedIds = new Set(assignedList.map((p) => p.id));

  // Fetch missing packages if any
  const missingPackageIds = otherPackageIds.filter((id) => !existingAssignedIds.has(id));
  if (missingPackageIds.length > 0) {
    const extraPackages = await Package.findAll({
      where: { id: missingPackageIds },
      include: [
        {
          model: Enrollment,
          as: 'enrollments',
          include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar'] }],
        },
        {
          model: ClassSchedule,
          as: 'schedules',
          where: { tutorId: user.id },
          required: false,
        },
        {
          model: LiveClass,
          as: 'liveClasses',
          where: { tutorId: user.id },
          required: false,
        },
      ],
    });
    for (const ep of extraPackages) {
      assignedList.push(ep.toJSON() as any);
    }
  }

  const now = Date.now();

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            👨‍🏫 Tutor Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Assigned Packages & Classes
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Here are the training packages assigned to you by the administration. Manage your regular class schedules, launch Google Meet links, and track enrolled students.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tutor/classes"
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            📅 View Full Schedule
          </Link>
        </div>
      </div>

      {assignedList.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            📦
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Packages Assigned Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            The administrator has not assigned you to any training packages yet (e.g. Web Development, Video Editing). Once assigned, your packages, class schedules, and students will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {assignedList.map((pkg) => {
            const classes: any[] = (pkg.liveClasses || []).sort(
              (a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );
            const totalClassesCount = pkg.totalClasses || 12;
            const conductedClasses = classes.filter(
              (c) => new Date(c.startTime).getTime() + (c.duration || 60) * 60000 <= now
            ).length;
            const upcomingClasses = classes.filter(
              (c) => new Date(c.startTime).getTime() + (c.duration || 60) * 60000 > now
            );
            const nextClass = upcomingClasses[0];

            const enrollments: any[] = pkg.enrollments || [];
            const scheduleRule = (pkg.schedules || [])[0];

            return (
              <div
                key={pkg.id}
                className="bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Package Header Banner */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-r from-slate-50/50 to-orange-50/30">
                  <div className="flex items-start gap-5">
                    {pkg.thumbnail ? (
                      <img
                        src={pkg.thumbnail}
                        alt={pkg.title}
                        className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-3xl shrink-0 font-bold border border-orange-200">
                        🎓
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-700">
                          {pkg.category || 'Course Package'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          Mode: {pkg.mode || 'ONLINE'}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          {totalClassesCount} Total Classes
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900">{pkg.title}</h2>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{pkg.description}</p>
                    </div>
                  </div>

                  {/* Top Stats Pill */}
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="flex-1 lg:flex-initial bg-white border border-slate-200 px-4 py-3 rounded-2xl text-center shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Enrolled Students</span>
                      <span className="text-lg font-black text-slate-900">{enrollments.length}</span>
                    </div>
                    <div className="flex-1 lg:flex-initial bg-white border border-slate-200 px-4 py-3 rounded-2xl text-center shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Conducted</span>
                      <span className="text-lg font-black text-orange-600">
                        {conductedClasses} / {totalClassesCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Recurring Schedule Info Banner */}
                  {scheduleRule ? (
                    <div className="p-4 bg-orange-50/70 border border-orange-200/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⏰</span>
                        <div>
                          <p className="font-bold text-orange-950">
                            Regular Batch Schedule:{' '}
                            <span className="text-orange-700">
                              Every {Array.isArray(scheduleRule.daysOfWeek) ? scheduleRule.daysOfWeek.join(' & ') : scheduleRule.daysOfWeek} at {scheduleRule.startTime}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Duration: {scheduleRule.duration} mins • Total {scheduleRule.totalClasses} classes batch • Started: {scheduleRule.startDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={scheduleRule.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        >
                          📹 Launch Class Room
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between text-xs text-slate-500">
                      <span>No active recurring schedule rule set yet by admin.</span>
                      {classes.length > 0 && <span>{classes.length} individual classes scheduled.</span>}
                    </div>
                  )}

                  {/* Two Column Grid: Upcoming Next Session & Enrolled Students */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Next Live Class to Teach */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">Next Scheduled Class to Teach</h4>
                        {upcomingClasses.length > 0 && (
                          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                            {upcomingClasses.length} upcoming
                          </span>
                        )}
                      </div>

                      {nextClass ? (
                        <div className="p-5 bg-gradient-to-br from-white to-orange-50/20 border border-orange-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-orange-600 text-white font-black text-xs rounded-md">
                                Class #{nextClass.classNumber || 1}
                              </span>
                              <h5 className="font-bold text-sm text-slate-900">{nextClass.title}</h5>
                            </div>
                            <p className="text-xs text-slate-500">
                              📅{' '}
                              {new Date(nextClass.startTime).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}{' '}
                              at{' '}
                              <strong>
                                {new Date(nextClass.startTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </strong>{' '}
                              ({nextClass.duration} mins)
                            </p>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            {nextClass.meetLink ? (
                              <a
                                href={nextClass.meetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                              >
                                📹 Start Class on Google Meet
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No meet link set</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400 italic">
                          No upcoming sessions. All scheduled classes for this package have been conducted!
                        </div>
                      )}

                      {/* All Sessions Table Accordion / Preview */}
                      {classes.length > 0 && (
                        <div className="mt-4 border border-slate-200/80 rounded-2xl overflow-hidden">
                          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-600">
                            Batch Class Roster ({classes.length} Total Sessions)
                          </div>
                          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                            {classes.map((cls) => {
                              const isPast =
                                new Date(cls.startTime).getTime() + (cls.duration || 60) * 60000 <= now;
                              return (
                                <div
                                  key={cls.id}
                                  className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-[11px]">
                                      #{cls.classNumber || '-'}
                                    </span>
                                    <span className="font-bold text-slate-900">{cls.title}</span>
                                    <span className="text-[11px] text-slate-400">
                                      {new Date(cls.startTime).toLocaleDateString([], {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                      ,{' '}
                                      {new Date(cls.startTime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isPast ? (
                                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                        CONDUCTED
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                        UPCOMING
                                      </span>
                                    )}
                                    {cls.meetLink && (
                                      <a
                                        href={cls.meetLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:text-blue-700 font-bold text-[11px]"
                                      >
                                        Meet Link ↗
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Enrolled Students in this package */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">Enrolled Students ({enrollments.length})</h4>
                        <Link
                          href="/tutor/students"
                          className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                        >
                          View All
                        </Link>
                      </div>

                      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 max-h-72 overflow-y-auto space-y-2.5">
                        {enrollments.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-4">
                            No students enrolled in this package yet.
                          </p>
                        ) : (
                          enrollments.map((enr) => {
                            const student = enr.User;
                            return (
                              <div
                                key={enr.id}
                                className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs"
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                  {student?.name ? student.name.charAt(0).toUpperCase() : 'S'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-900 truncate">
                                    {student?.name || 'Student'}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">{student?.email}</p>
                                </div>
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  {enr.status || 'ACTIVE'}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
