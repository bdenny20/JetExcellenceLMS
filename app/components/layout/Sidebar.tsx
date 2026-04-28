import Link from "next/link";
import type { DashboardRole } from "../../types/training";

type SidebarProps = {
    role: DashboardRole;
};

export function Sidebar({ role }: SidebarProps) {
    const navItems =
        role === "admin"
            ? ["Dashboard", "Modules", "Assignments", "Users", "Reports"]
            : ["Dashboard", "Available Modules", "Settings"];

    return (
        <aside className="hidden w-64 shrink-0 border-r-4 border-red-900 bg-zinc-900 text-white lg:block">
            <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                    Navigation
                </p>

                <nav className="mt-8 space-y-2">
                    {navItems.map((item, index) => (
                        <Link
                            key={item}
                            href="/"
                            className={`block border-l-4 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] transition ${
                                index === 0
                                    ? "border-red-700 bg-zinc-800 text-white"
                                    : "border-transparent text-zinc-300 hover:border-red-700 hover:bg-zinc-800 hover:text-white"
                            }`}
                        >
                            {item}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-10 border-t border-zinc-700 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Current Mode
                </p>
                <p className="mt-2 text-lg font-black uppercase tracking-wide text-white">
                    {role === "admin" ? "Admin" : "User"}
                </p>
            </div>
        </aside>
    );
}