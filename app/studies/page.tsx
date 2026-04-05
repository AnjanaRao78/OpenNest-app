"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { loadStudiesByAuthor, saveStudiesEntry } from "@/lib/studies";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "courses" | "calendar">(
    "dashboard"
  );

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

  async function reloadCourses(uid: string) {
    const studyData = await loadStudiesByAuthor(uid);
    setCourses(studyData);
  }

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

      await reloadCourses(user.uid);

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

  const uniqueDays = useMemo(() => {
    return Array.from(new Set(courses.flatMap((c) => c.days || [])));
  }, [courses]);

  const totalVacationDays = useMemo(() => {
    return courses.reduce(
      (sum, course) => sum + ((course.vacationDays || []).length ?? 0),
      0
    );
  }, [courses]);

  const groupedByDay = useMemo(() => {
    return weekDays.map((day) => ({
      day,
      courses: courses.filter((course) => (course.days || []).includes(day)),
    }));
  }, [courses]);

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <PageHeader title="Studies" />

        <div className="opennest-hero-card">
          <div className="opennest-card-title">Your academic planner</div>
          <div className="opennest-card-subtitle">
            Keep courses, class times, rooms, term dates, and vacation days in one
            shared place that feels orderly without feeling cold.
          </div>
        </div>

        <div className="opennest-summary-grid">
          <SummaryCard label="Current Term" value={currentTerm} />
          <SummaryCard label="Courses" value={courses.length} />
          <SummaryCard
            label="Class Days"
            value={uniqueDays.length > 0 ? uniqueDays.join(", ") : "-"}
          />
          <SummaryCard label="Vacation Days" value={totalVacationDays} />
        </div>

        <div className="opennest-tabs">
          <button
            type="button"
            className={`opennest-tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`opennest-tab ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            Courses
          </button>
          <button
            type="button"
            className={`opennest-tab ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            Calendar
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="opennest-module-grid">
            <div className="opennest-section">
              <DashboardCard
                title="Weekly Class Schedule"
                accentClass="opennest-module-accent-studies"
              >
                <div className="opennest-list">
                  {groupedByDay.map(({ day, courses }) => (
                    <div key={day} className="opennest-list-card teal">
                      <div className="opennest-list-title">{day}</div>

                      {courses.length === 0 ? (
                        <div className="opennest-list-meta">No classes</div>
                      ) : (
                        <div className="opennest-meta-grid">
                          {courses.map((course) => (
                            <div key={`${day}-${course.id}`}>
                              <strong>
                                {course.courseCode ? `${course.courseCode} — ` : ""}
                                {course.courseName}
                              </strong>
                              <div className="opennest-list-meta">
                                {course.startTime || "-"} - {course.endTime || "-"}
                                {course.classroom ? ` · ${course.classroom}` : ""}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard title="Term Overview">
                <div className="opennest-meta-grid">
                  <div>
                    <strong>Term:</strong> {currentTerm}
                  </div>
                  <div>
                    <strong>Courses Registered:</strong> {courses.length}
                  </div>
                  <div>
                    <strong>Class Days:</strong>{" "}
                    {uniqueDays.length > 0 ? uniqueDays.join(", ") : "-"}
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Vacation Days">
                {totalVacationDays > 0 ? (
                  <div className="opennest-pill-row">
                    {Array.from(
                      new Set(courses.flatMap((course) => course.vacationDays || []))
                    )
                      .sort()
                      .map((day) => (
                        <span key={day} className="opennest-pill gold">
                          {day}
                        </span>
                      ))}
                  </div>
                ) : (
                  <div className="opennest-empty-state">No vacation days added.</div>
                )}
              </DashboardCard>
            </div>

            <div className="opennest-section">
              <DashboardCard
                title="Add Course"
                accentClass="opennest-module-accent-studies"
              >
                <div className="opennest-form">
                  <input
                    placeholder="Term (e.g. Spring 2026)"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                  />

                  <input
                    placeholder="Course Name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                  />

                  <input
                    placeholder="Course Code"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  />

                  <div>
                    <div className="opennest-list-meta" style={{ marginBottom: 8 }}>
                      Class Days
                    </div>
                    <div className="opennest-pill-row">
                      {weekDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`opennest-pill ${
                            days.includes(day) ? "teal" : ""
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    placeholder="Classroom"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                  />

                  <div className="opennest-form-row-2">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>

                  <div className="opennest-form-row-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="opennest-list-meta" style={{ marginBottom: 8 }}>
                      Vacation Days
                    </div>

                    <div className="opennest-form-row-2">
                      <input
                        type="date"
                        value={vacationInput}
                        onChange={(e) => setVacationInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={addVacationDay}
                        className="opennest-button opennest-button-secondary"
                      >
                        Add Day
                      </button>
                    </div>

                    {vacationDays.length > 0 && (
                      <div className="opennest-pill-row" style={{ marginTop: 10 }}>
                        {vacationDays.map((day) => (
                          <span key={day} className="opennest-pill gold">
                            {day}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <textarea
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={handleSave}
                    className="opennest-button opennest-button-primary"
                  >
                    Save Course
                  </button>

                  {message && <div className="opennest-list-meta">{message}</div>}
                </div>
              </DashboardCard>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <DashboardCard
            title="Registered Courses"
            accentClass="opennest-module-accent-studies"
          >
            <div className="opennest-list">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course.id} className="opennest-list-card teal">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="opennest-list-title">
                          {course.courseCode ? `${course.courseCode} — ` : ""}
                          {course.courseName}
                        </div>
                        <div className="opennest-list-meta">{course.term || "-"}</div>
                      </div>

                      <Link
                        href={`/entry/studies/${course.id}`}
                        className="underline text-sm"
                      >
                        Open
                      </Link>
                    </div>

                    <div className="opennest-meta-grid">
                      <div>
                        <strong>Days:</strong>{" "}
                        {Array.isArray(course.days) ? course.days.join(", ") : "-"}
                      </div>
                      <div>
                        <strong>Classroom:</strong> {course.classroom || "-"}
                      </div>
                      <div>
                        <strong>Time:</strong>{" "}
                        {course.startTime && course.endTime
                          ? `${course.startTime} - ${course.endTime}`
                          : "-"}
                      </div>
                      <div>
                        <strong>Dates:</strong> {course.startDate || "-"} →{" "}
                        {course.endDate || "-"}
                      </div>
                      <div>
                        <strong>Vacation Days:</strong>{" "}
                        {Array.isArray(course.vacationDays) &&
                        course.vacationDays.length > 0
                          ? course.vacationDays.join(", ")
                          : "-"}
                      </div>
                      <div>
                        <strong>Notes:</strong> {course.notes || "-"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="opennest-empty-state">No courses added yet.</div>
              )}
            </div>
          </DashboardCard>
        )}

        {activeTab === "calendar" && (
          <DashboardCard
            title="Academic Calendar Snapshot"
            accentClass="opennest-module-accent-studies"
          >
            {courses.length > 0 ? (
              <div className="opennest-list">
                {courses.map((course) => (
                  <div key={course.id} className="opennest-list-card teal">
                    <div className="opennest-list-title">
                      {course.courseName}
                    </div>
                    <div className="opennest-list-meta">
                      {course.startDate || "-"} → {course.endDate || "-"}
                    </div>

                    <div className="opennest-pill-row" style={{ marginTop: 10 }}>
                      {(course.days || []).map((day: string) => (
                        <span key={day} className="opennest-pill teal">
                          {day}
                        </span>
                      ))}
                      {Array.isArray(course.vacationDays) &&
                        course.vacationDays.map((day: string) => (
                          <span key={day} className="opennest-pill gold">
                            Vacation {day}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="opennest-empty-state">
                Add courses to see your academic calendar snapshot.
              </div>
            )}
          </DashboardCard>
        )}
      </div>

      <BottomNav />
    </div>
  );
}