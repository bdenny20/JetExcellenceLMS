import Image from "next/image";
import type { DashboardRole } from "../../types/training";

type TopHeaderProps = {
    role: DashboardRole;
    onRoleChange: (role: DashboardRole) => void;
};

export function TopHeader({ role, onRoleChange }: TopHeaderProps) {
    return (
        <header className="bg-black text-white">
            <div className="flex min-h-24 items-center justify-between px-8">
                <div className="flex items-center gap-5">
                    <div className="flex h-20 w-44 items-center justify-center p-2">
                        <Image
                            src="/jetexcellence-logo.png"
                            alt="JETEXCELLENCE logo"
                            width={176}
                            height={80}
                            className="h-auto max-h-16 w-auto object-contain"
                            priority
                        />
                    </div>

                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">
                            JETEXCELLENCE
                        </h1>
                        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-red-500">
                            Learning Management System
                        </p>
                    </div>
                </div>

                <div className="hidden text-right md:block">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
                        Training Platform
                    </p>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-white">
                        {role === "admin" ? "Administrator View" : "User Dashboard"}
                    </p>
                </div>
            </div>

            <div className="h-[3px] bg-red-800" />

            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-8 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-300">
                    {role === "admin"
                        ? "Back Office • Administration"
                        : "Training • User Portal"}
                </p>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => onRoleChange("employee")}
                        className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
                            role === "employee"
                                ? "border-red-700 bg-red-800 text-white"
                                : "border-zinc-700 bg-black text-zinc-300 hover:border-red-700 hover:text-white"
                        }`}
                    >
                        User
                    </button>

                    <button
                        type="button"
                        onClick={() => onRoleChange("admin")}
                        className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
                            role === "admin"
                                ? "border-red-700 bg-red-800 text-white"
                                : "border-zinc-700 bg-black text-zinc-300 hover:border-red-700 hover:text-white"
                        }`}
                    >
                        Admin
                    </button>
                </div>
            </div>
        </header>
    );
}