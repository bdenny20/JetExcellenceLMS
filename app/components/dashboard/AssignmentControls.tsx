import type { AppUser } from "../../types/training";

type AssignmentControlsProps = {
    users: AppUser[];
    selectedUserId: string;
    onSelectedUserChange: (userId: string) => void;
};

export function AssignmentControls({
                                       users,
                                       selectedUserId,
                                       onSelectedUserChange,
                                   }: AssignmentControlsProps) {
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Assignment Controls</h2>

            <label className="block text-sm font-medium text-slate-700 mb-2">
                Assign modules to:
            </label>

            <select
                value={selectedUserId}
                onChange={(event) => onSelectedUserChange(event.target.value)}
                className="w-full border border-slate-300 p-2 rounded"
            >
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name} — {user.email}
                    </option>
                ))}
            </select>

            <p className="text-sm text-slate-500 mt-2">
                Prototype note: Employee view is currently locked to Demo User.
            </p>
        </div>
    );
}