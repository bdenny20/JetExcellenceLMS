import type {
    AdminUserTrainingSummary,
    UserDirectoryRecord,
} from "../../types/training";

type AdminUserOverviewTableProps = {
    users: UserDirectoryRecord[];
    selectedUserIds: string[];
    trainingSummaryByUserId: Record<string, AdminUserTrainingSummary>;
    onToggleUserSelection: (userId: string) => void;
    onSelectAllVisible: () => void;
    onClearSelection: () => void;
    onViewDetails: (user: UserDirectoryRecord) => void;
};

function getSummaryForUser(
    userId: string,
    trainingSummaryByUserId: Record<string, AdminUserTrainingSummary>
): AdminUserTrainingSummary {
    return (
        trainingSummaryByUserId[userId] ?? {
            assignedCount: 0,
            completedCount: 0,
            overdueCount: 0,
        }
    );
}

export function AdminUserOverviewTable({
                                           users,
                                           selectedUserIds,
                                           trainingSummaryByUserId,
                                           onToggleUserSelection,
                                           onSelectAllVisible,
                                           onClearSelection,
                                           onViewDetails,
                                       }: AdminUserOverviewTableProps) {
    const selectedUserIdSet = new Set(selectedUserIds);

    const allVisibleSelected =
        users.length > 0 && users.every((user) => selectedUserIdSet.has(user.id));

    return (
        <section className="border border-zinc-300 bg-white shadow-sm">
            <div className="border-b border-zinc-300 px-5 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-red-800">
                            Personnel Roster
                        </p>

                        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-zinc-950">
                            Training Administrator Overview
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <p className="mr-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                            {users.length} Records
                        </p>

                        <button
                            type="button"
                            disabled={users.length === 0}
                            onClick={
                                allVisibleSelected ? onClearSelection : onSelectAllVisible
                            }
                            className="border border-zinc-500 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-700 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-300"
                        >
                            {allVisibleSelected ? "Clear Visible" : "Select All Visible"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-visible">
                <table className="w-full table-fixed border-collapse">
                    <colgroup>
                        <col className="w-[5%]" />
                        <col className="w-[15%]" />
                        <col className="w-[22%]" />
                        <col className="w-[10%]" />
                        <col className="w-[10%]" />
                        <col className="w-[10%]" />
                        <col className="w-[7%]" />
                        <col className="w-[5%]" />
                        <col className="w-[5%]" />
                        <col className="w-[5%]" />
                        <col className="w-[6%]" />
                    </colgroup>

                    <thead className="bg-zinc-100">
                    <tr className="border-b border-zinc-300">
                        <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                            Select
                        </th>

                        <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-red-800">
                            Name
                        </th>

                        <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                            Email
                        </th>

                        <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                            Emp #
                        </th>

                        <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                            Dept
                        </th>

                        <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                            Role
                        </th>

                        <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                            Loc
                        </th>

                        <th className="px-3 py-4 text-center text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                            Asg
                        </th>

                        <th className="px-3 py-4 text-center text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                            Cmp
                        </th>

                        <th className="px-3 py-4 text-center text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                            Od
                        </th>

                        <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                            Details
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td
                                colSpan={11}
                                className="px-5 py-8 text-center text-sm font-semibold text-zinc-500"
                            >
                                No users match the selected filter.
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => {
                            const summary = getSummaryForUser(
                                user.id,
                                trainingSummaryByUserId
                            );

                            const isSelected = selectedUserIdSet.has(user.id);

                            return (
                                <tr
                                    key={user.id}
                                    className={`border-b border-zinc-200 transition ${
                                        isSelected ? "bg-red-50" : "hover:bg-zinc-50"
                                    }`}
                                >
                                    <td className="px-3 py-4 align-top">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleUserSelection(user.id)}
                                            className="h-4 w-4 accent-red-800"
                                            aria-label={`Select ${user.name}`}
                                        />
                                    </td>

                                    <td className="px-3 py-4 align-top">
                                        <p className="break-words text-sm font-bold text-zinc-900">
                                            {user.name}
                                        </p>

                                        {user.is_management && (
                                            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] text-red-800">
                                                Management
                                            </p>
                                        )}
                                    </td>

                                    <td className="px-3 py-4 align-top">
                                        <p className="break-all text-xs font-medium text-zinc-700">
                                            {user.email}
                                        </p>
                                    </td>

                                    <td className="px-3 py-4 align-top">
                                        <p className="break-words text-xs font-bold text-zinc-700">
                                            {user.employee_number ?? "—"}
                                        </p>
                                    </td>

                                    <td className="px-3 py-4 align-top text-xs font-bold text-zinc-900">
                                        {user.department ?? "—"}
                                    </td>

                                    <td className="px-3 py-4 align-top text-xs font-semibold text-zinc-700">
                                        {user.role ?? "—"}
                                    </td>

                                    <td className="px-3 py-4 align-top text-xs font-bold text-zinc-700">
                                        {user.location_code ?? "—"}
                                    </td>

                                    <td className="px-3 py-4 text-center align-top">
                      <span className="font-black text-zinc-900">
                        {summary.assignedCount}
                      </span>
                                    </td>

                                    <td className="px-3 py-4 text-center align-top">
                      <span className="font-black text-emerald-700">
                        {summary.completedCount}
                      </span>
                                    </td>

                                    <td className="px-3 py-4 text-center align-top">
                      <span
                          className={`font-black ${
                              summary.overdueCount > 0
                                  ? "text-red-700"
                                  : "text-zinc-500"
                          }`}
                      >
                        {summary.overdueCount}
                      </span>
                                    </td>

                                    <td className="px-3 py-4 align-top">
                                        <button
                                            type="button"
                                            onClick={() => onViewDetails(user)}
                                            className="border border-red-800 px-2 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-red-800 transition hover:bg-red-800 hover:text-white"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}