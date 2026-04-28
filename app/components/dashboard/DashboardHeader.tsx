import type { DashboardRole } from "../../types/training";

type DashboardHeaderProps = {
    role: DashboardRole;
    onRoleChange: (role: DashboardRole) => void;
};

export function DashboardHeader({ role, onRoleChange }: DashboardHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Training Platform
                </h1>
                <p className="text-slate-500 mt-1">
                    Manage modules, assignments, and completion status.
                </p>
            </div>

            <div className="space-x-2">
                <button
                    onClick={() => onRoleChange("employee")}
                    className={`px-4 py-2 rounded text-white ${
                        role === "employee" ? "bg-blue-600" : "bg-blue-400"
                    }`}
                >
                    Employee
                </button>

                <button
                    onClick={() => onRoleChange("admin")}
                    className={`px-4 py-2 rounded text-white ${
                        role === "admin" ? "bg-slate-900" : "bg-slate-700"
                    }`}
                >
                    Admin
                </button>
            </div>
        </div>
    );
}