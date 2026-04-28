import Link from "next/link";
import type {
    Course,
    DashboardRole,
    ModuleVersion,
} from "../../types/training";

type ModuleCardProps = {
    course: Course;
    role: DashboardRole;
    isCompleted: boolean;
    assignmentStatus: string;
    dueDate: string;
    isAssigning: boolean;
    isArchiving: boolean;
    isEditing: boolean;
    isUpdating: boolean;
    isVersionHistoryExpanded: boolean;
    isVersionHistoryLoading: boolean;
    versionHistory: ModuleVersion[];
    onDueDateChange: (moduleId: string, dueDate: string) => void;
    onAssignModule: (moduleId: string) => void;
    onArchiveModule: (moduleId: string) => void;
    onStartEditModule: (moduleId: string) => void;
    onCancelEditModule: () => void;
    onUpdateModule: (
        event: React.FormEvent<HTMLFormElement>,
        moduleId: string
    ) => void;
    onToggleVersionHistory: (moduleId: string) => void;
};

function formatDate(value: string | null) {
    if (!value) {
        return "Not published";
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function ModuleCard({
                               course,
                               role,
                               isCompleted,
                               assignmentStatus,
                               dueDate,
                               isAssigning,
                               isArchiving,
                               isEditing,
                               isUpdating,
                               isVersionHistoryExpanded,
                               isVersionHistoryLoading,
                               versionHistory,
                               onDueDateChange,
                               onAssignModule,
                               onArchiveModule,
                               onStartEditModule,
                               onCancelEditModule,
                               onUpdateModule,
                               onToggleVersionHistory,
                           }: ModuleCardProps) {
    const actionInProgress = isAssigning || isArchiving || isUpdating;

    if (isEditing) {
        return (
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                <form onSubmit={(event) => onUpdateModule(event, course.id)}>
                    <div className="flex justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Edit Module
                            </h2>
                            <p className="text-sm text-slate-500">
                                Saving changes will create a new published module version.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onCancelEditModule}
                                disabled={isUpdating}
                                className="bg-slate-200 text-slate-800 px-4 py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-green-300 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            name="title"
                            defaultValue={course.title}
                            disabled={isUpdating}
                            className="w-full p-2 border border-slate-300 rounded disabled:bg-slate-100"
                            required
                        />

                        <input
                            name="category"
                            defaultValue={course.category ?? ""}
                            disabled={isUpdating}
                            className="w-full p-2 border border-slate-300 rounded disabled:bg-slate-100"
                            required
                        />

                        <input
                            name="description"
                            defaultValue={course.description ?? ""}
                            disabled={isUpdating}
                            className="w-full p-2 border border-slate-300 rounded md:col-span-2 disabled:bg-slate-100"
                            required
                        />

                        <input
                            name="estimated_minutes"
                            type="number"
                            min="1"
                            defaultValue={course.estimated_minutes ?? 1}
                            disabled={isUpdating}
                            className="w-full p-2 border border-slate-300 rounded disabled:bg-slate-100"
                            required
                        />
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between gap-4">
                <div>
                    <Link href={`/modules/${course.id}`}>
                        <h2 className="text-xl font-bold text-blue-700 hover:underline">
                            {course.title}
                        </h2>
                    </Link>

                    <p className="mt-2 text-slate-700">{course.description}</p>
                </div>

                <div className="text-right">
                    {isCompleted ? (
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold">
              ✔ Completed
            </span>
                    ) : (
                        <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-semibold">
              Not Completed
            </span>
                    )}

                    {role === "admin" && (
                        <p className="mt-2 text-sm text-slate-500">
                            Assignment: {assignmentStatus}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-4 text-sm text-slate-500 flex gap-4">
                <span>Category: {course.category ?? "Uncategorized"}</span>
                <span>
          Estimated Time:{" "}
                    {course.estimated_minutes
                        ? `${course.estimated_minutes} minutes`
                        : "Not set"}
        </span>
            </div>

            {role === "admin" && (
                <>
                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                        <input
                            type="date"
                            value={dueDate}
                            disabled={actionInProgress}
                            onChange={(event) =>
                                onDueDateChange(course.id, event.target.value)
                            }
                            className="border border-slate-300 p-2 rounded disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />

                        <button
                            type="button"
                            disabled={actionInProgress}
                            onClick={() => onAssignModule(course.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {isAssigning ? "Assigning..." : "Assign to Selected User"}
                        </button>

                        <button
                            type="button"
                            disabled={actionInProgress}
                            onClick={() => onStartEditModule(course.id)}
                            className="bg-slate-700 text-white px-4 py-2 rounded disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            Edit Module
                        </button>
                        <Link
                            href={`/modules/${course.id}/manage`}
                            className="bg-emerald-600 text-white px-4 py-2 rounded"
                        >
                            Manage Content
                        </Link>

                        <button
                            type="button"
                            disabled={actionInProgress}
                            onClick={() => onToggleVersionHistory(course.id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {isVersionHistoryExpanded
                                ? "Hide Version History"
                                : "Version History"}
                        </button>

                        <button
                            type="button"
                            disabled={actionInProgress}
                            onClick={() => onArchiveModule(course.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                            {isArchiving ? "Archiving..." : "Archive Module"}
                        </button>
                    </div>

                    {isVersionHistoryExpanded && (
                        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <h3 className="font-semibold text-slate-900">
                                Version History
                            </h3>

                            {isVersionHistoryLoading ? (
                                <p className="mt-3 text-sm text-slate-500">
                                    Loading version history...
                                </p>
                            ) : versionHistory.length === 0 ? (
                                <p className="mt-3 text-sm text-slate-500">
                                    No versions found for this module.
                                </p>
                            ) : (
                                <div className="mt-3 overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                        <tr className="border-b border-slate-200 text-slate-500">
                                            <th className="py-2 pr-4">Version</th>
                                            <th className="py-2 pr-4">Title</th>
                                            <th className="py-2 pr-4">Status</th>
                                            <th className="py-2 pr-4">Published</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {versionHistory.map((version) => (
                                            <tr
                                                key={version.id}
                                                className="border-b border-slate-200 last:border-b-0"
                                            >
                                                <td className="py-2 pr-4 font-semibold text-slate-900">
                                                    v{version.version_number}
                                                </td>
                                                <td className="py-2 pr-4 text-slate-700">
                                                    {version.title || "Untitled version"}
                                                </td>
                                                <td className="py-2 pr-4">
                            <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                              {version.status}
                            </span>
                                                </td>
                                                <td className="py-2 pr-4 text-slate-500">
                                                    {formatDate(version.published_at)}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}