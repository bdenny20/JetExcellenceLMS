import type { DashboardRole } from "../../types/training";

type EmptyStateProps = {
    role: DashboardRole;
};

export function EmptyState({ role }: EmptyStateProps) {
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm text-slate-600">
            {role === "employee"
                ? "No assigned training modules found."
                : "No modules have been created yet."}
        </div>
    );
}