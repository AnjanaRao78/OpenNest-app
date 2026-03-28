"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { saveStudiesEntry, loadStudiesByAuthor } from "@/lib/studies";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import StudiesCalendarDashboard from "@/components/StudiesCalendarDashboard"; 

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"courses" | "calendar">("courses");

  const [term, setTerm] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [classroom, setClassroom] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vacationInput, setVacationInput] = useState("");
  const [vacationDays, setVacationDays] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) return;

      const userProfile = await getUserProfile(authUser.uid);
      setProfile(userProfile);

      const studyData = await loadStudiesByAuthor(authUser.uid);
      setCourses(studyData);
    });

    return () => unsub();
  }, []);

  function toggleDay(day: string) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function addVacationDay() {
    if (!vacationInput) return;
    if (!vacationDays.includes(vacationInput)) {
      setVacationDays((prev) => [...prev, vacationInput].sort());
    }
    setVacationInput("");
  }

  async function handleSave() {
    if (!user || !profile) {
      setMessage("Please complete login setup first.");
      return;
    }

    if (!term || !courseName || days.length === 0 || !startDate || !endDate) {
      setMessage("Please fill the required course fields.");
      return;
    }

    try {
      await saveStudiesEntry({
        familyId: profile.familyId,
        authorUid: user.uid,
        authorName: user.displayName || "Unknown",
        term,
        courseName,
        courseCode,
        days,
        classroom,
        startTime,
        endTime,
        startDate,
        endDate,
        vacationDays,
        notes,
        createdAt: Date.now(),
      });

      const studyData = await loadStudiesByAuthor(user.uid);
      setCourses(studyData);

      setTerm("");
      setCourseName("");
      setCourseCode("");
      setDays([]);
      setClassroom("");
      setStartTime("");
      setEndTime("");
      setStartDate("");
      setEndDate("");
      setVacationDays([]);
      setNotes("");
      setMessage("Course saved.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save course.");
    }
  }

  const currentTerm = courses[0]?.term || "-";

  return (
    <div>
      <PageHeader title="Studies" />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">Current Term</div>
            <div className="font-semibold mt-1">{currentTerm}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">Courses</div>
            <div className="font-semibold mt-1">{courses.length}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">Class Days</div>
            <div className="font-semibold mt-1">
              {Array.from(new Set(courses.flatMap((c) => c.days || []))).join(", ") || "-"}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">Vacation Days</div>
            <div className="font-semibold mt-1">
              {courses.reduce(
                (sum, c) => sum + ((c.vacationDays || []).length ?? 0),
                0
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-xl border ${
              activeTab === "courses" ? "bg-black text-white" : "bg-white"
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-4 py-2 rounded-xl border ${
              activeTab === "calendar" ? "bg-black text-white" : "bg-white"
            }`}
          >
            Calendar
          </button>
        </div>

        {activeTab === "courses" ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Form */}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Add Course</h2>

              <input
                className="border p-2 w-full mb-3 rounded"
                placeholder="Term (e.g. Spring 2026)"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />

              <input
                className="border p-2 w-full mb-3 rounded"
                placeholder="Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />

              <input
                className="border p-2 w-full mb-3 rounded"
                placeholder="Course Code"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
              />

              <div className="mb-3">
                <div className="text-sm font-medium mb-2">Days</div>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-full border text-sm ${
                        days.includes(day)
                          ? "bg-black text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <input
                className="border p-2 w-full mb-3 rounded"
                placeholder="Classroom"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="time"
                  className="border p-2 w-full rounded"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <input
                  type="time"
                  className="border p-2 w-full rounded"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="date"
                  className="border p-2 w-full rounded"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="border p-2 w-full rounded"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <div className="text-sm font-medium mb-2">Vacation Days</div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    className="border p-2 rounded flex-1"
                    value={vacationInput}
                    onChange={(e) => setVacationInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addVacationDay}
                    className="px-3 py-2 rounded bg-black text-white"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {vacationDays.map((day) => (
                    <span
                      key={day}
                      className="px-2 py-1 rounded-full text-xs bg-amber-100 border"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                className="border p-2 w-full mb-3 rounded"
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <button
                onClick={handleSave}
                className="bg-black text-white px-4 py-2 rounded-xl"
              >
                Save Course
              </button>

              {message && <p className="mt-3 text-sm">{message}</p>}
            </div>

            {/* Course list */}
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {course.courseCode ? `${course.courseCode} — ` : ""}
                        {course.courseName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{course.term}</p>
                    </div>

                    {course.id && (
                      <Link
                        href={`/entry/studies/${course.id}`}
                        className="text-sm underline"
                      >
                        Open
                      </Link>
                    )}
                  </div>

                  <div className="mt-4 grid gap-2 text-sm">
                    <p><strong>Days:</strong> {(course.days || []).join(", ")}</p>
                    <p><strong>Classroom:</strong> {course.classroom || "-"}</p>
                    <p><strong>Time:</strong> {course.startTime || "-"} - {course.endTime || "-"}</p>
                    <p><strong>Dates:</strong> {course.startDate} → {course.endDate}</p>
                    <p>
                      <strong>Vacation Days:</strong>{" "}
                      {(course.vacationDays || []).length > 0
                        ? course.vacationDays.join(", ")
                        : "-"}
                    </p>
                  </div>
                </div>
              ))}

              {courses.length === 0 && (
                <div className="rounded-2xl border bg-white p-5 shadow-sm text-sm text-gray-500">
                  No courses added yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <StudiesCalendarDashboard courses={courses} />
        )}
      </div>
    </div>
  );
}