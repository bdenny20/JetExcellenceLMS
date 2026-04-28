"use client";

import { AssignmentControls } from "./components/dashboard/AssignmentControls";
import { CreateModuleForm } from "./components/dashboard/CreateModuleForm";
import { DashboardNotice } from "./components/dashboard/DashboardNotice";
import { EmptyState } from "./components/dashboard/EmptyState";
import { KpiCard } from "./components/dashboard/KpiCard";
import { ModuleCard } from "./components/dashboard/ModuleCard";
import { UserTrainingTable } from "./components/dashboard/UserTrainingTable";
import { PlatformShell } from "./components/layout/PlatformShell";
import { useTrainingDashboard } from "./hooks/useTrainingDashboard";
import { AdminFilterBar } from "./components/dashboard/AdminFilterBar";
import { AdminUserOverviewTable } from "./components/dashboard/AdminUserOverviewTable";
import { BulkAssignmentPanel } from "./components/dashboard/BulkAssignmentPanel";
import { AdminUserTrainingDetailsDrawer } from "./components/dashboard/AdminUserTrainingDetailsDrawer";

export default function Home() {
    const dashboard = useTrainingDashboard();
    const filteredUserCount = dashboard.filteredUserDirectory.length;

    const filteredGroupTrainingSummary = dashboard.filteredUserDirectory.reduce(
        (summary, user) => {
            const userSummary = dashboard.adminTrainingSummaryByUserId[user.id] ?? {
                assignedCount: 0,
                completedCount: 0,
                overdueCount: 0,
            };

            return {
                assignedCount: summary.assignedCount + userSummary.assignedCount,
                completedCount: summary.completedCount + userSummary.completedCount,
                overdueCount: summary.overdueCount + userSummary.overdueCount,
            };
        },
        {
            assignedCount: 0,
            completedCount: 0,
            overdueCount: 0,
        }
    );

    const filteredGroupCompletionRate =
        filteredGroupTrainingSummary.assignedCount > 0
            ? Math.round(
                (filteredGroupTrainingSummary.completedCount /
                    filteredGroupTrainingSummary.assignedCount) *
                100
            )
            : 0;

    const visibleModuleCount = dashboard.visibleCourses.length;
    const completedVisibleModuleCount = dashboard.visibleCourses.filter((course) =>
        dashboard.completedModuleIds.has(course.id)
    ).length;
    const pendingVisibleModuleCount =
        visibleModuleCount - completedVisibleModuleCount;

    const overdueCount = Object.values(
        dashboard.assignmentStatusByModuleId
    ).filter((status) => status === "overdue").length;

    const assignedCount = Object.values(
        dashboard.assignmentStatusByModuleId
    ).filter((status) =>
        ["assigned", "in_progress", "overdue", "completed"].includes(status)
    ).length;

    if (dashboard.loading) {
        return (
            <PlatformShell role="employee" onRoleChange={() => undefined}>
                <div className="border border-zinc-300 bg-white p-8 shadow-sm">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-red-800">
                        Loading
                    </p>
                    <h1 className="mt-3 text-3xl font-black uppercase text-zinc-950">
                        Training Dashboard
                    </h1>
                    <p className="mt-3 text-zinc-600">
                        Loading training modules, assignments, users, and completion data.
                    </p>
                </div>
            </PlatformShell>
        );
    }

    return (
        <PlatformShell role={dashboard.role} onRoleChange={dashboard.setRole}>
            <div className="space-y-8">
                <section className="flex flex-col gap-4 border-b border-zinc-300 pb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-red-800">
                            {dashboard.role === "admin" ? "Administration" : "User Dashboard"}
                        </p>

                        <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-zinc-950">
                            {dashboard.role === "admin"
                                ? "Training Program Overview"
                                : "My Training Overview"}
                        </h1>

                        <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-zinc-600">
                            {dashboard.role === "admin"
                                ? "Monitor training modules, assignments, content versions, and learner completion status."
                                : "Review assigned modules, track completion status, and continue required training."}
                        </p>
                    </div>
                </section>

                {dashboard.notice && (
                    <DashboardNotice
                        type={dashboard.notice.type}
                        message={dashboard.notice.message}
                        onDismiss={dashboard.dismissNotice}
                    />
                )}

                {dashboard.role === "admin" ? (
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <KpiCard
                            label="Filtered Users"
                            value={filteredUserCount}
                            helper="Selected group"
                        />

                        <KpiCard
                            label="Assigned Modules"
                            value={filteredGroupTrainingSummary.assignedCount}
                            helper="Group total"
                        />

                        <KpiCard
                            label="Completed"
                            value={filteredGroupTrainingSummary.completedCount}
                            helper="Completed assignments"
                            tone="green"
                        />

                        <KpiCard
                            label="Overdue"
                            value={filteredGroupTrainingSummary.overdueCount}
                            helper="Requires attention"
                            tone="red"
                        />

                        <KpiCard
                            label="Completion Rate"
                            value={`${filteredGroupCompletionRate}%`}
                            helper="Completed / assigned"
                            tone={
                                filteredGroupCompletionRate >= 90
                                    ? "green"
                                    : filteredGroupCompletionRate >= 60
                                        ? "amber"
                                        : "red"
                            }
                        />
                    </section>
                ) : (
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <KpiCard
                            label="Assigned Modules"
                            value={visibleModuleCount}
                            helper="Total assigned"
                        />
                        <KpiCard
                            label="Completed"
                            value={completedVisibleModuleCount}
                            helper="Finished modules"
                            tone="green"
                        />
                        <KpiCard
                            label="Remaining"
                            value={pendingVisibleModuleCount}
                            helper="Still required"
                            tone="amber"
                        />
                        <KpiCard
                            label="Overdue"
                            value={overdueCount}
                            helper="Past due"
                            tone="red"
                        />
                    </section>
                )}

                {dashboard.role === "admin" && (
                    <>
                        <AdminFilterBar
                            departmentOptions={dashboard.departmentOptions}
                            roleOptions={dashboard.roleOptions}
                            locationOptions={dashboard.locationOptions}
                            selectedDepartment={dashboard.selectedDepartment}
                            selectedRole={dashboard.selectedRoleFilter}
                            selectedLocation={dashboard.selectedLocation}
                            onDepartmentChange={dashboard.updateSelectedDepartment}
                            onRoleChange={dashboard.updateSelectedRoleFilter}
                            onLocationChange={dashboard.updateSelectedLocation}
                        />

                        <BulkAssignmentPanel
                            courses={dashboard.visibleCourses}
                            selectedUserCount={dashboard.selectedAdminUserIds.length}
                            selectedModuleId={dashboard.bulkAssignmentModuleId}
                            dueDate={dashboard.bulkAssignmentDueDate}
                            isAssigning={dashboard.bulkAssigning}
                            onSelectedModuleChange={dashboard.setBulkAssignmentModuleId}
                            onDueDateChange={dashboard.setBulkAssignmentDueDate}
                            onAssign={dashboard.handleBulkAssignModule}
                            onClearSelection={dashboard.clearSelectedAdminUsers}
                        />

                        <AdminUserOverviewTable
                            users={dashboard.filteredUserDirectory}
                            selectedUserIds={dashboard.selectedAdminUserIds}
                            trainingSummaryByUserId={dashboard.adminTrainingSummaryByUserId}
                            onToggleUserSelection={dashboard.toggleAdminUserSelection}
                            onSelectAllVisible={dashboard.selectAllFilteredAdminUsers}
                            onClearSelection={dashboard.clearSelectedAdminUsers}
                            onViewDetails={dashboard.openAdminUserTrainingDetails}
                        />

                        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                            <CreateModuleForm
                                onCreateModule={dashboard.handleCreateModule}
                                isCreating={dashboard.creatingModule}
                            />

                            <AssignmentControls
                                users={dashboard.users}
                                selectedUserId={dashboard.selectedUserId}
                                onSelectedUserChange={dashboard.setSelectedUserId}
                            />
                        </section>
                    </>
                )}

                <section>
                    <div className="mb-4 flex items-center justify-between border-b border-zinc-300 pb-3">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-950">
                            {dashboard.role === "admin"
                                ? "Module Administration"
                                : "Assigned Training"}
                        </h2>

                        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                            {visibleModuleCount} Records
                        </p>
                    </div>

                    {dashboard.visibleCourses.length === 0 ? (
                        <EmptyState role={dashboard.role} />
                    ) : dashboard.role === "employee" ? (
                        <UserTrainingTable
                            courses={dashboard.visibleCourses}
                            completedModuleIds={dashboard.completedModuleIds}
                            assignmentStatusByModuleId={dashboard.assignmentStatusByModuleId}
                            dueDatesByModuleId={dashboard.dueDatesByModuleId}
                        />
                    ) : (
                        <div className="space-y-5">
                            {dashboard.visibleCourses.map((course) => (
                                <ModuleCard
                                    key={course.id}
                                    course={course}
                                    role={dashboard.role}
                                    isCompleted={dashboard.completedModuleIds.has(course.id)}
                                    assignmentStatus={
                                        dashboard.assignmentStatusByModuleId[course.id] ??
                                        "unassigned"
                                    }
                                    dueDate={dashboard.dueDatesByModuleId[course.id] ?? ""}
                                    isAssigning={dashboard.assigningModuleId === course.id}
                                    isArchiving={dashboard.archivingModuleId === course.id}
                                    isEditing={dashboard.editingModuleId === course.id}
                                    isUpdating={dashboard.updatingModuleId === course.id}
                                    isVersionHistoryExpanded={
                                        dashboard.expandedVersionHistoryModuleId === course.id
                                    }
                                    isVersionHistoryLoading={
                                        dashboard.loadingVersionHistoryModuleId === course.id
                                    }
                                    versionHistory={
                                        dashboard.versionHistoryByModuleId[course.id] ?? []
                                    }
                                    onDueDateChange={dashboard.updateDueDateForModule}
                                    onAssignModule={dashboard.handleAssignModuleToUser}
                                    onArchiveModule={dashboard.handleArchiveModule}
                                    onStartEditModule={dashboard.startEditingModule}
                                    onCancelEditModule={dashboard.cancelEditingModule}
                                    onUpdateModule={dashboard.handleUpdateModule}
                                    onToggleVersionHistory={dashboard.toggleVersionHistory}
                                />
                            ))}
                        </div>

                    )}
                </section>
            </div>
            <AdminUserTrainingDetailsDrawer
                user={dashboard.selectedAdminUserForDetails}
                details={dashboard.adminUserTrainingDetails}
                summary={
                    dashboard.selectedAdminUserForDetails
                        ? dashboard.adminTrainingSummaryByUserId[
                        dashboard.selectedAdminUserForDetails.id
                        ] ?? {
                        assignedCount: 0,
                        completedCount: 0,
                        overdueCount: 0,
                    }
                        : {
                            assignedCount: 0,
                            completedCount: 0,
                            overdueCount: 0,
                        }
                }
                isLoading={dashboard.loadingAdminUserTrainingDetails}
                onClose={dashboard.closeAdminUserTrainingDetails}
            />
        </PlatformShell>
    );
}