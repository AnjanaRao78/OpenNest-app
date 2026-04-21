"use client";
import {
 FamilyCalendarModule,
 FamilyCalendarUserOption,
} from "@/types/familyCalendar";
type Props = {
 selectedModule: FamilyCalendarModule;
 onModuleChange: (value: FamilyCalendarModule) => void;
 userOptions: FamilyCalendarUserOption[];
 selectedUserUid: string | "all";
 onUserChange: (value: string | "all") => void;
 currentOffset: number;
};
function getRangeLabel(currentOffset: number) {
 if (currentOffset === 0) return "Current month";
 if (currentOffset > 0) return `${currentOffset} month(s) ahead`;
 return `${Math.abs(currentOffset)} month(s) back`;
}
export default function FamilyCalendarFilters({
 selectedModule,
 onModuleChange,
 userOptions,
 selectedUserUid,
 onUserChange,
 currentOffset,
}: Props) {
 return (
<div className="max-w-screen-md mx-auto px-3 pb-3">
<div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
<div className="grid gap-3 md:grid-cols-3">
<div className="space-y-1">
<label className="block text-xs font-medium text-gray-500">
             Module
</label>
<select
             className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-teal-500"
             value={selectedModule}
             onChange={(e) =>
               onModuleChange(e.target.value as FamilyCalendarModule)
             }
>
<option value="studies">Studies</option>
<option value="reading">Reading</option>
<option value="internship">Internship</option>
<option value="reflection">Reflection</option>
</select>
</div>
<div className="space-y-1">
<label className="block text-xs font-medium text-gray-500">
             Show entries for
</label>
<select
             className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-teal-500"
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
<div className="space-y-1">
<label className="block text-xs font-medium text-gray-500">
             Range
</label>
<div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
             {getRangeLabel(currentOffset)}
</div>
</div>
</div>
</div>
</div>
 );
}