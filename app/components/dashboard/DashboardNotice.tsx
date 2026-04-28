type DashboardNoticeProps = {
    type: "success" | "error";
    message: string;
    onDismiss: () => void;
};

export function DashboardNotice({
                                    type,
                                    message,
                                    onDismiss,
                                }: DashboardNoticeProps) {
    const styles =
        type === "success"
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800";

    return (
        <div
            className={`flex items-start justify-between gap-4 border p-4 rounded-xl shadow-sm ${styles}`}
        >
            <p className="text-sm font-medium">{message}</p>

            <button
                type="button"
                onClick={onDismiss}
                className="text-sm font-bold opacity-70 hover:opacity-100"
                aria-label="Dismiss message"
            >
                ×
            </button>
        </div>
    );
}