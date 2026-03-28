"use client";

import { CalendarModuleType, CalendarViewType } from "@/types/calendar";

type UserOption = {
  uid: string;
  displayName: string;
  relationship?: string;
};

interface Props {
  userOptions: UserOption[];
  selectedUserUid: string | "all";
  onUserChange: (value: string | "all") => void;
  selectedModules: CalendarModuleType[];
  onToggleModule: (module: CalendarModuleType) => void;
  selectedView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  currentOffset: number;
}

const allModules: CalendarModuleType[] = [
  "reflection",
  "studies",
  "internship",
  "reading",
];

export default function CalendarFilters({
  userOptions,
  selectedUserUid,
  onUserChange,
  selectedModules,
  onToggleModule,
  selectedView,
  onViewChange,
  currentOffset,
}: Props) {
  return (
    <div className="max-w-screen-sm mx-auto px-3 pb-3">
      <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">User</label>
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={selectedUserUid}
              onChange={(e) =>
                onUserChange(e.target.value === "all" ? "all" : e.target.value)
              }
            >
              <option value="all">All family members</option>
              {userOptions.map((user) => (
                <option key={user.uid} value={user.uid}>
                  {user.displayName}
                  {user.relationship ? ` · ${user.relationship}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">View</label>
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={selectedView}
              onChange={(e) => onViewChange(e.target.value as CalendarViewType)}
            >
              <option value="month">Month</option>
              <option value="agenda">Agenda</option>
              <option value="schedule">Schedule</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Range</label>
            <div className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-sm">
              {currentOffset === 0 ? "Current month" : `${currentOffset} month(s) out`}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-2">Modules</label>
          <div className="flex flex-wrap gap-2">
            {allModules.map((module) => {
              const active = selectedModules.includes(module);

              return (
                <button
                  key={module}
                  type="button"
                  onClick={() => onToggleModule(module)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-gray-300"
                  }`}
                >
                  {module[0].toUpperCase() + module.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}