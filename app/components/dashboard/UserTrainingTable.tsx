import Link from "next/link";
import type { Course } from "../../types/training";

type UserTrainingTableProps = {
    courses: Course[];
    completedModuleIds: Set<string>;
    assignmentStatusByModuleId: Record<string, string>;
    dueDatesByModuleId: Record<string, string>;
};

function formatDueDate(value: string) {
    if (!value) {
        return "—";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

function getDaysRemainingText(dueDate: string, isCompleted: boolean) {
    if (!dueDate) {
        return "—";
    }

    if (isCompleted) {
        return "Completed";
    }

    const today = new Date();
    const due = new Date(`${dueDate}T00:00:00`);

    if (Number.isNaN(due.getTime())) {
        return "—";
    }

    const todayAtMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const diffInMs = due.getTime() - todayAtMidnight.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) {
        return `${Math.abs(diffInDays)} overdue`;
    }

    if (diffInDays === 0) {
        return "Due today";
    }

    return `${diffInDays} days`;
}

function getStatusLabel(
    assignmentStatus: string,
    isCompleted: boolean
): "Completed" | "Overdue" | "Required" | "Optional" | "Pending" {
    if (isCompleted || assignmentStatus === "completed") {
        return "Completed";
    }

    if (assignmentStatus === "overdue") {
        return "Overdue";
    }

    if (assignmentStatus === "pending") {
        return "Pending";
    }

    if (assignmentStatus === "assigned" || assignmentStatus === "in_progress") {
        return "Required";
    }

    return "Optional";
}

function getStatusClasses(status: string) {
    switch (status) {
        case "Completed":
            return "text-emerald-700";
        case "Overdue":
            return "text-red-700";
        case "Pending":
            return "text-amber-700";
        case "Required":
            return "text-zinc-900";
        default:
            return "text-zinc-600";
    }
}

function getCourseNumber(courseId: string) {
    return `MOD-${courseId.slice(0, 8).toUpperCase()}`;
}

export function UserTrainingTable({
                                      courses,
                                      completedModuleIds,
                                      assignmentStatusByModuleId,
                                      dueDatesByModuleId,
                                  }: UserTrainingTableProps) {
    return (
        <div className="overflow-hidden border border-zinc-300 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                    <thead className="bg-zinc-100">
                    <tr className="border-b border-zinc-300">
                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-red-800">
                            Course Name
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                            Course Number
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                            Due By
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                            Days Remaining
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                            Status
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                            Action
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {courses.map((course) => {
                        const isCompleted = completedModuleIds.has(course.id);
                        const assignmentStatus =
                            assignmentStatusByModuleId[course.id] ?? "unassigned";
                        const dueDate = dueDatesByModuleId[course.id] ?? "";
                        const statusLabel = getStatusLabel(
                            assignmentStatus,
                            isCompleted
                        );

                        return (
                            <tr
                                key={course.id}
                                className="border-b border-zinc-200 transition hover:bg-zinc-50"
                            >
                                <td className="px-5 py-4 align-top">
                                    <div>
                                        <p className="text-base font-bold text-zinc-900">
                                            {course.title}
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-500">
                                            {course.description || "No module description provided."}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-5 py-4 align-top text-sm font-semibold text-zinc-700">
                                    {getCourseNumber(course.id)}
                                </td>

                                <td className="px-5 py-4 align-top text-sm font-semibold text-zinc-700">
                                    {formatDueDate(dueDate)}
                                </td>

                                <td className="px-5 py-4 align-top text-sm font-semibold text-zinc-700">
                                    {getDaysRemainingText(dueDate, isCompleted)}
                                </td>

                                <td className="px-5 py-4 align-top">
                    <span
                        className={`text-sm font-black uppercase tracking-[0.08em] ${getStatusClasses(
                            statusLabel
                        )}`}
                    >
                      {statusLabel}
                    </span>
                                </td>

                                <td className="px-5 py-4 align-top">
                                    <Link
                                        href={`/modules/${course.id}`}
                                        className="inline-flex border border-red-800 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-800 transition hover:bg-red-800 hover:text-white"
                                    >
                                        {isCompleted ? "Review Module" : "Open Module"}
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}