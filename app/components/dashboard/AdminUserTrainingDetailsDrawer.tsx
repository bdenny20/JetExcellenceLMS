import type {
    AdminUserTrainingDetailRecord,
    AdminUserTrainingSummary,
    UserDirectoryRecord,
} from "../../types/training";

type AdminUserTrainingDetailsDrawerProps = {
    user: UserDirectoryRecord | null;
    details: AdminUserTrainingDetailRecord[];
    summary: AdminUserTrainingSummary;
    isLoading: boolean;
    onClose: () => void;
};

function formatDate(value: string | null) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

function formatStatus(status: string, isOverdue: boolean) {
    if (isOverdue) {
        return "Overdue";
    }

    return status.replace("_", " ");
}

function getStatusClasses(status: string, isOverdue: boolean) {
    if (isOverdue) {
        return "border-red-200 bg-red-50 text-red-800";
    }

    if (status === "completed") {
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
    }

    if (status === "in_progress") {
        return "border-amber-200 bg-amber-50 text-amber-800";
    }

    return "border-zinc-200 bg-zinc-50 text-zinc-800";
}

function getCompletionRate(summary: AdminUserTrainingSummary) {
    if (summary.assignedCount === 0) {
        return 0;
    }

    return Math.round((summary.completedCount / summary.assignedCount) * 100);
}

function DetailMetricCard({
                              label,
                              value,
                              tone = "default",
                          }: {
    label: string;
    value: string | number;
    tone?: "default" | "green" | "red" | "amber";
}) {
    const valueClasses = {
        default: "text-zinc-950",
        green: "text-emerald-700",
        red: "text-red-700",
        amber: "text-amber-700",
    };

    return (
        <div className="border border-zinc-300 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                {label}
            </p>

            <p className={`mt-3 text-3xl font-black ${valueClasses[tone]}`}>
                {value}
            </p>
        </div>
    );
}

export function AdminUserTrainingDetailsDrawer({
                                                   user,
                                                   details,
                                                   summary,
                                                   isLoading,
                                                   onClose,
                                               }: AdminUserTrainingDetailsDrawerProps) {
    if (!user) {
        return null;
    }

    const completionRate = getCompletionRate(summary);

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Close details drawer"
                onClick={onClose}
                className="absolute inset-0 bg-black/60"
            />

            <aside className="absolute right-0 top-0 flex h-full w-full max-w-6xl flex-col bg-zinc-100 shadow-2xl">
                <div className="border-b-4 border-red-800 bg-black text-white">
                    <div className="px-6 py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">
                                    Personnel Training Record
                                </p>

                                <h2 className="mt-2 text-3xl font-black uppercase tracking-tight">
                                    {user.name}
                                </h2>

                                <p className="mt-1 text-sm font-semibold text-zinc-300">
                                    {user.email}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="border border-zinc-600 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-200 transition hover:border-red-700 hover:bg-red-800 hover:text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 bg-zinc-950 px-6 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-300">
                            {user.department ?? "No Department"} • {user.role ?? "No Role"} •{" "}
                            {user.location_code ?? "No Location"}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        <div className="border border-zinc-300 bg-white p-4 shadow-sm lg:col-span-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-800">
                                Employee Profile
                            </p>

                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                        Employee #
                                    </p>
                                    <p className="mt-1 text-sm font-black text-zinc-950">
                                        {user.employee_number ?? "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                        Status
                                    </p>
                                    <p
                                        className={`mt-1 text-sm font-black uppercase tracking-[0.12em] ${
                                            user.is_active ? "text-emerald-700" : "text-red-700"
                                        }`}
                                    >
                                        {user.is_active ? "Active" : "Inactive"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                        Department
                                    </p>
                                    <p className="mt-1 text-sm font-black text-zinc-950">
                                        {user.department ?? "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                        Role
                                    </p>
                                    <p className="mt-1 text-sm font-black text-zinc-950">
                                        {user.role ?? "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                        Location
                                    </p>
                                    <p className="mt-1 text-sm font-black text-zinc-950">
                                        {user.location_code ?? "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                        Management
                                    </p>
                                    <p className="mt-1 text-sm font-black text-zinc-950">
                                        {user.is_management ? "Yes" : "No"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DetailMetricCard
                            label="Completion Rate"
                            value={`${completionRate}%`}
                            tone={
                                completionRate >= 90
                                    ? "green"
                                    : completionRate >= 60
                                        ? "amber"
                                        : "red"
                            }
                        />

                        <DetailMetricCard
                            label="Overdue"
                            value={summary.overdueCount}
                            tone={summary.overdueCount > 0 ? "red" : "default"}
                        />
                    </section>

                    <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <DetailMetricCard label="Assigned" value={summary.assignedCount} />
                        <DetailMetricCard
                            label="Completed"
                            value={summary.completedCount}
                            tone="green"
                        />
                        <DetailMetricCard
                            label="Remaining"
                            value={Math.max(
                                summary.assignedCount - summary.completedCount,
                                0
                            )}
                            tone={
                                summary.assignedCount - summary.completedCount > 0
                                    ? "amber"
                                    : "green"
                            }
                        />
                    </section>

                    <section className="mt-6 border border-zinc-300 bg-white shadow-sm">
                        <div className="border-b border-zinc-300 px-5 py-4">
                            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-red-800">
                                        Assignment Records
                                    </p>

                                    <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-zinc-950">
                                        Module Training Status
                                    </h3>
                                </div>

                                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                                    {details.length} Records
                                </p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="p-8">
                                <div className="border border-zinc-300 bg-zinc-50 p-6">
                                    <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-600">
                                        Loading training details...
                                    </p>
                                </div>
                            </div>
                        ) : details.length === 0 ? (
                            <div className="p-8">
                                <div className="border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
                                    <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-700">
                                        No assignments found
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-zinc-500">
                                        This user does not currently have assigned training.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[920px] border-collapse">
                                    <thead className="bg-zinc-100">
                                    <tr className="border-b border-zinc-300">
                                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-red-800">
                                            Module
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                                            Status
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                                            Due
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                                            Completed
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                                            Version
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                                            Score
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {details.map((detail) => (
                                        <tr
                                            key={detail.assignmentId}
                                            className={`border-b border-zinc-200 ${
                                                detail.isOverdue ? "bg-red-50/60" : ""
                                            }`}
                                        >
                                            <td className="px-5 py-4 align-top">
                                                <p className="font-bold text-zinc-950">
                                                    {detail.moduleTitle}
                                                </p>

                                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                                    {detail.moduleCategory ?? "Uncategorized"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 align-top">
                          <span
                              className={`inline-flex border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${getStatusClasses(
                                  detail.assignmentStatus,
                                  detail.isOverdue
                              )}`}
                          >
                            {formatStatus(
                                detail.assignmentStatus,
                                detail.isOverdue
                            )}
                          </span>
                                            </td>

                                            <td className="px-5 py-4 align-top text-sm font-semibold text-zinc-700">
                                                {formatDate(detail.dueDate)}
                                            </td>

                                            <td className="px-5 py-4 align-top text-sm font-semibold text-zinc-700">
                                                {formatDate(detail.completedAt)}
                                            </td>

                                            <td className="px-5 py-4 align-top">
                                                <p className="text-sm font-black text-zinc-900">
                                                    {detail.lockedVersionNumber
                                                        ? `v${detail.lockedVersionNumber}`
                                                        : "—"}
                                                </p>

                                                {detail.lockedVersionTitle && (
                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        {detail.lockedVersionTitle}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 align-top text-sm font-black text-zinc-900">
                                                {detail.score !== null ? `${detail.score}%` : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </aside>
        </div>
    );
}