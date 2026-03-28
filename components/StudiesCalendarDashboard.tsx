"use client";

interface StudiesCourse {
  id?: string;
  term: string;
  courseName: string;
  courseCode?: string;
  days: string[];
  classroom: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  vacationDays?: string[];
}

const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudiesCalendarDashboard({
  courses,
}: {
  courses: StudiesCourse[];
}) {
  const grouped = dayOrder.map((day) => ({
    day,
    courses: courses.filter((course) => (course.days || []).includes(day)),
  }));

  const allVacationDays = Array.from(
    new Set(courses.flatMap((course) => course.vacationDays || []))
  ).sort();

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
      {/* Weekly schedule */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Weekly Class Schedule</h2>

        <div className="space-y-4">
          {grouped.map(({ day, courses }) => (
            <div key={day} className="border rounded-xl p-4">
              <div className="font-semibold mb-3">{day}</div>

              {courses.length === 0 ? (
                <p className="text-sm text-gray-500">No classes</p>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={`${day}-${course.id}`}
                      className="rounded-xl bg-slate-50 border p-3"
                    >
                      <div className="font-medium">
                        {course.courseCode ? `${course.courseCode} — ` : ""}
                        {course.courseName}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {course.startTime} - {course.endTime}
                      </div>
                      <div className="text-sm text-gray-600">
                        Room: {course.classroom || "-"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {course.startDate} → {course.endDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Term + vacations */}
      <div className="space-y-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Term Overview</h2>

          {courses.length > 0 ? (
            <div className="space-y-2 text-sm">
              <p><strong>Term:</strong> {courses[0].term}</p>
              <p><strong>Courses Registered:</strong> {courses.length}</p>
              <p>
                <strong>Class Days:</strong>{" "}
                {Array.from(new Set(courses.flatMap((c) => c.days || []))).join(", ") || "-"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No term data yet.</p>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Vacation Days</h2>

          {allVacationDays.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allVacationDays.map((day) => (
                <span
                  key={day}
                  className="px-3 py-1 rounded-full text-sm bg-amber-100 border"
                >
                  {day}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No vacation days added.</p>
          )}
        </div>
      </div>
    </div>
  );
}