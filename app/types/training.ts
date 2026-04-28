export type Course = {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    is_required: boolean;
    estimated_minutes: number | null;
    is_active: boolean;
    created_at: string;
};
export type UserDirectoryRecord = {
    id: string;
    employee_number: string | null;
    name: string;
    email: string;
    is_active: boolean;
    department: string | null;
    role: string | null;
    is_management: boolean | null;
    location_code: string | null;
    location_name: string | null;
};

export type ModuleVersionStatus = "draft" | "published" | "archived";

export type ModuleVersion = {
    id: string;
    module_id: string;
    version_number: number;
    title: string;
    description: string | null;
    content: string;
    status: ModuleVersionStatus;
    published_at: string | null;
    created_at: string;
};

export type Assignment = {
    id: string;
    user_id: string;
    module_id: string;
    locked_module_version_id: string | null;
    status: "assigned" | "in_progress" | "completed" | "overdue";
    due_date: string | null;
    started_at: string | null;
    completed_at: string | null;
};

export type CompletionRecord = {
    id: string;
    user_id: string;
    module_id: string;
    module_version_id: string;
    score: number | null;
    completed_at: string;
};

export type AppUser = {
    id: string;
    email: string;
    name: string;
};
export type AdminUserTrainingSummary = {
    assignedCount: number;
    completedCount: number;
    overdueCount: number;
};
export type AdminUserTrainingDetailRecord = {
    assignmentId: string;
    moduleId: string;
    moduleTitle: string;
    moduleCategory: string | null;
    assignmentStatus: string;
    dueDate: string | null;
    completedAt: string | null;
    lockedModuleVersionId: string | null;
    lockedVersionNumber: number | null;
    lockedVersionTitle: string | null;
    score: number | null;
    isOverdue: boolean;
};

export type DashboardRole = "employee" | "admin";