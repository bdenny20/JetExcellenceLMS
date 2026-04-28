type KpiCardProps = {
    label: string;
    value: string | number;
    helper?: string;
    tone?: "default" | "red" | "green" | "amber";
};

export function KpiCard({
                            label,
                            value,
                            helper,
                            tone = "default",
                        }: KpiCardProps) {
    const accentClasses = {
        default: "text-zinc-900 border-zinc-300",
        red: "text-red-800 border-red-800",
        green: "text-emerald-800 border-emerald-700",
        amber: "text-amber-800 border-amber-700",
    };

    return (
        <div className="border border-zinc-300 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                {label}
            </p>

            <div
                className={`mt-4 inline-flex min-w-20 items-center justify-center border-2 px-5 py-3 ${accentClasses[tone]}`}
            >
                <span className="text-4xl font-black leading-none">{value}</span>
            </div>

            {helper && (
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {helper}
                </p>
            )}
        </div>
    );
}