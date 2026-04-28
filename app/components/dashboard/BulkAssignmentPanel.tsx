import type { Course } from "../../types/training";

type BulkAssignmentPanelProps = {
    courses: Course[];
    selectedUserCount: number;
    selectedModuleId: string;
    dueDate: string;
    isAssigning: boolean;
    onSelectedModuleChange: (moduleId: string) => void;
    onDueDateChange: (dueDate: string) => void;
    onAssign: () => void;
    onClearSelection: () => void;
};

export function BulkAssignmentPanel({
                                        courses,
                                        selectedUserCount,
                                        selectedModuleId,
                                        dueDate,
                                        isAssigning,
                                        onSelectedModuleChange,
                                        onDueDateChange,
                                        onAssign,
                                        onClearSelection,
                                    }: BulkAssignmentPanelProps) {
    const canAssign = selectedUserCount > 0 && selectedModuleId && dueDate;

    return (
        <section className="border border-zinc-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-red-800">
                        Bulk Assignment
                    </p>
                    <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-zinc-950">
                        Assign Training to Selected Users
                    </h2>
                    <p className="mt-2 text-sm font-medium text-zinc-600">
                        Select users from the roster below, choose a module and due date,
                        then assign training in one action.
                    </p>
                </div>

                <div className="border border-zinc-300 px-4 py-3 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                        Selected
                    </p>
                    <p className="text-3xl font-black text-zinc-950">
                        {selectedUserCount}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.7fr_auto_auto] lg:items-end">
                <div>
                    <label className="mb-1 block text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                        Module
                    </label>
                    <select
                        value={selectedModuleId}
                        disabled={isAssigning}
                        onChange={(event) => onSelectedModuleChange(event.target.value)}
                        className="w-full border border-zinc-400 bg-white px-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:border-red-800 disabled:bg-zinc-100"
                    >
                        <option value="">Select module</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                        Due Date
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        disabled={isAssigning}
                        onChange={(event) => onDueDateChange(event.target.value)}
                        className="w-full border border-zinc-400 bg-white px-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:border-red-800 disabled:bg-zinc-100"
                    />
                </div>

                <button
                    type="button"
                    disabled={!canAssign || isAssigning}
                    onClick={onAssign}
                    className="border border-red-800 bg-red-800 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-300"
                >
                    {isAssigning ? "Assigning..." : "Assign"}
                </button>

                <button
                    type="button"
                    disabled={selectedUserCount === 0 || isAssigning}
                    onClick={onClearSelection}
                    className="border border-zinc-500 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-zinc-700 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-300"
                >
                    Clear
                </button>
            </div>
        </section>
    );
}