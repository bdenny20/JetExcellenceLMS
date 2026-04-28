import type { ReactNode } from "react";
import type { DashboardRole } from "../../types/training";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

type PlatformShellProps = {
    role: DashboardRole;
    onRoleChange: (role: DashboardRole) => void;
    children: ReactNode;
};

export function PlatformShell({
                                  role,
                                  onRoleChange,
                                  children,
                              }: PlatformShellProps) {
    return (
        <main className="min-h-screen bg-zinc-100">
            <TopHeader role={role} onRoleChange={onRoleChange} />

            <div className="flex min-h-[calc(100vh-9.5rem)]">
                <Sidebar role={role} />

                <section className="min-w-0 flex-1">
                    <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
                </section>
            </div>
        </main>
    );
}