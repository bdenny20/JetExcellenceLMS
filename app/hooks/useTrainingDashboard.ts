"use client";

import { useEffect, useMemo, useState } from "react";
import {
    archiveModule,
    assignModuleToUser as createAssignment,
    createModule,
    getActiveUsers,
    getAssignmentsForUser,
    getCompletionRecordsForUser,
    getExistingActiveAssignment,
    getModules,
    getModuleVersions,
    getUserDirectory,
    updateModuleAndCreateVersion,
    getAllAssignments,
    getAllCompletionRecords,
    assignModuleToUsers,
    getAdminUserTrainingDetails,
} from "../../lib/trainingAPI";
import type {
    AppUser,
    Assignment,
    CompletionRecord,
    Course,
    DashboardRole,
    ModuleVersion,
    UserDirectoryRecord,
    AdminUserTrainingSummary,
    AdminUserTrainingDetailRecord,

} from "../types/training";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

type DashboardNoticeState = {
    type: "success" | "error";
    message: string;
} | null;

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown error";
}

export function useTrainingDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [completionRecords, setCompletionRecords] = useState<
        CompletionRecord[]
    >([]);
    const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
    const [allCompletionRecords, setAllCompletionRecords] = useState<
        CompletionRecord[]
    >([]);
    const [selectedAdminUserForDetails, setSelectedAdminUserForDetails] =
        useState<UserDirectoryRecord | null>(null);

    const [adminUserTrainingDetails, setAdminUserTrainingDetails] = useState<
        AdminUserTrainingDetailRecord[]
    >([]);

    const [loadingAdminUserTrainingDetails, setLoadingAdminUserTrainingDetails] =
        useState(false);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [userDirectory, setUserDirectory] = useState<UserDirectoryRecord[]>([]);

    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [selectedAdminUserIds, setSelectedAdminUserIds] = useState<string[]>([]);
    const [bulkAssignmentModuleId, setBulkAssignmentModuleId] = useState("");
    const [bulkAssignmentDueDate, setBulkAssignmentDueDate] = useState("");
    const [bulkAssigning, setBulkAssigning] = useState(false);

    const [role, setRole] = useState<DashboardRole>("employee");
    const [selectedUserId, setSelectedUserId] = useState(DEMO_USER_ID);
    const [dueDatesByModuleId, setDueDatesByModuleId] = useState<
        Record<string, string>
    >({});

    const [creatingModule, setCreatingModule] = useState(false);
    const [assigningModuleId, setAssigningModuleId] = useState<string | null>(
        null
    );
    const [archivingModuleId, setArchivingModuleId] = useState<string | null>(
        null
    );
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [updatingModuleId, setUpdatingModuleId] = useState<string | null>(null);

    const [expandedVersionHistoryModuleId, setExpandedVersionHistoryModuleId] =
        useState<string | null>(null);
    const [loadingVersionHistoryModuleId, setLoadingVersionHistoryModuleId] =
        useState<string | null>(null);
    const [versionHistoryByModuleId, setVersionHistoryByModuleId] = useState<
        Record<string, ModuleVersion[]>
    >({});

    const [notice, setNotice] = useState<DashboardNoticeState>(null);
    const [loading, setLoading] = useState(true);

    const showNotice = (type: "success" | "error", message: string) => {
        setNotice({
            type,
            message,
        });
    };

    const dismissNotice = () => {
        setNotice(null);
    };
    const fetchAllAssignments = async () => {
        try {
            const records = await getAllAssignments();
            setAllAssignments(records);
        } catch (error) {
            showNotice("error", `All assignments error: ${getErrorMessage(error)}`);
        }
    };

    const fetchAllCompletionRecords = async () => {
        try {
            const records = await getAllCompletionRecords();
            setAllCompletionRecords(records);
        } catch (error) {
            showNotice(
                "error",
                `All completion records error: ${getErrorMessage(error)}`
            );
        }
    };
    const fetchModules = async () => {
        try {
            const modules = await getModules();
            setCourses(modules);
        } catch (error) {
            showNotice("error", `Modules error: ${getErrorMessage(error)}`);
        }
    };
    const toggleAdminUserSelection = (userId: string) => {
        setSelectedAdminUserIds((currentUserIds) => {
            if (currentUserIds.includes(userId)) {
                return currentUserIds.filter((currentUserId) => currentUserId !== userId);
            }

            return [...currentUserIds, userId];
        });
    };

    const selectAllFilteredAdminUsers = () => {
        setSelectedAdminUserIds(filteredUserDirectory.map((user) => user.id));
    };

    const clearSelectedAdminUsers = () => {
        setSelectedAdminUserIds([]);
    };
    const fetchAssignments = async () => {
        try {
            const userAssignments = await getAssignmentsForUser(DEMO_USER_ID);
            setAssignments(userAssignments);
        } catch (error) {
            showNotice("error", `Assignments error: ${getErrorMessage(error)}`);
        }
    };
    const handleBulkAssignModule = async () => {
        if (bulkAssigning) {
            return;
        }

        if (selectedAdminUserIds.length === 0) {
            showNotice("error", "Select at least one user before assigning training.");
            return;
        }

        if (!bulkAssignmentModuleId) {
            showNotice("error", "Select a module to assign.");
            return;
        }

        if (!bulkAssignmentDueDate) {
            showNotice("error", "Select a due date.");
            return;
        }

        setBulkAssigning(true);

        try {
            const result = await assignModuleToUsers({
                userIds: selectedAdminUserIds,
                moduleId: bulkAssignmentModuleId,
                dueDate: bulkAssignmentDueDate,
            });

            showNotice(
                "success",
                `Bulk assignment complete. Assigned: ${result.assignedCount}. Skipped existing: ${result.skippedCount}.`
            );

            setBulkAssignmentModuleId("");
            setBulkAssignmentDueDate("");
            setSelectedAdminUserIds([]);

            await fetchAllAssignments();
            await fetchAssignments();
        } catch (error) {
            showNotice("error", `Bulk assignment failed: ${getErrorMessage(error)}`);
        } finally {
            setBulkAssigning(false);
        }
    };
    const openAdminUserTrainingDetails = async (user: UserDirectoryRecord) => {
        setSelectedAdminUserForDetails(user);
        setLoadingAdminUserTrainingDetails(true);

        try {
            const details = await getAdminUserTrainingDetails(user.id);
            setAdminUserTrainingDetails(details);
        } catch (error) {
            showNotice(
                "error",
                `Could not load user training details: ${getErrorMessage(error)}`
            );
        } finally {
            setLoadingAdminUserTrainingDetails(false);
        }
    };

    const closeAdminUserTrainingDetails = () => {
        setSelectedAdminUserForDetails(null);
        setAdminUserTrainingDetails([]);
    };
    const fetchCompletionRecords = async () => {
        try {
            const records = await getCompletionRecordsForUser(DEMO_USER_ID);
            setCompletionRecords(records);
        } catch (error) {
            showNotice(
                "error",
                `Completion records error: ${getErrorMessage(error)}`
            );
        }
    };

    const fetchUsers = async () => {
        try {
            const activeUsers = await getActiveUsers();
            setUsers(activeUsers);
        } catch (error) {
            showNotice("error", `Users error: ${getErrorMessage(error)}`);
        }
    };

    const fetchUserDirectory = async () => {
        try {
            const directory = await getUserDirectory();
            console.log("User directory loaded:", directory.length, directory);
            setUserDirectory(directory);
        } catch (error) {
            showNotice("error", `User directory error: ${getErrorMessage(error)}`);
        }
    };

    const loadDashboardData = async () => {
        setLoading(true);

        try {
            await Promise.all([
                fetchModules(),
                fetchAssignments(),
                fetchCompletionRecords(),
                fetchUsers(),
                fetchUserDirectory(),
                fetchAllAssignments(),
                fetchAllCompletionRecords(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadDashboardData();
    }, []);

    const handleCreateModule = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (creatingModule) {
            return;
        }

        const formElement = event.currentTarget;
        const form = new FormData(formElement);

        const title = String(form.get("title") ?? "").trim();
        const description = String(form.get("description") ?? "").trim();
        const category = String(form.get("category") ?? "").trim();
        const estimatedMinutes = Number(form.get("estimated_minutes"));

        if (!title || !description || !category || !estimatedMinutes) {
            showNotice("error", "Please fill out every field.");
            return;
        }

        setCreatingModule(true);

        try {
            await createModule({
                title,
                description,
                category,
                estimatedMinutes,
            });

            formElement.reset();
            showNotice("success", "Module created successfully.");
            await fetchModules();
        } catch (error) {
            showNotice("error", `Could not create module: ${getErrorMessage(error)}`);
        } finally {
            setCreatingModule(false);
        }
    };

    const startEditingModule = (moduleId: string) => {
        setEditingModuleId(moduleId);
    };

    const cancelEditingModule = () => {
        setEditingModuleId(null);
    };

    const handleUpdateModule = async (
        event: React.FormEvent<HTMLFormElement>,
        moduleId: string
    ) => {
        event.preventDefault();

        if (updatingModuleId) {
            return;
        }

        const formElement = event.currentTarget;
        const form = new FormData(formElement);

        const title = String(form.get("title") ?? "").trim();
        const description = String(form.get("description") ?? "").trim();
        const category = String(form.get("category") ?? "").trim();
        const estimatedMinutes = Number(form.get("estimated_minutes"));

        if (!title || !description || !category || !estimatedMinutes) {
            showNotice("error", "Please fill out every field.");
            return;
        }

        setUpdatingModuleId(moduleId);

        try {
            await updateModuleAndCreateVersion({
                moduleId,
                title,
                description,
                category,
                estimatedMinutes,
                content: "",
            });

            showNotice("success", "Module updated and new version created.");
            setEditingModuleId(null);
            await fetchModules();

            const versions = await getModuleVersions(moduleId);

            setVersionHistoryByModuleId((currentHistory) => ({
                ...currentHistory,
                [moduleId]: versions,
            }));
        } catch (error) {
            showNotice("error", `Could not update module: ${getErrorMessage(error)}`);
        } finally {
            setUpdatingModuleId(null);
        }
    };

    const updateDueDateForModule = (moduleId: string, dueDate: string) => {
        setDueDatesByModuleId((currentDueDates) => ({
            ...currentDueDates,
            [moduleId]: dueDate,
        }));
    };

    const handleAssignModuleToUser = async (moduleId: string) => {
        if (assigningModuleId || archivingModuleId) {
            return;
        }

        if (!selectedUserId) {
            showNotice("error", "Please select a user first.");
            return;
        }

        const dueDate = dueDatesByModuleId[moduleId];

        if (!dueDate) {
            showNotice("error", "Please select a due date.");
            return;
        }

        setAssigningModuleId(moduleId);

        try {
            const existingAssignment = await getExistingActiveAssignment(
                selectedUserId,
                moduleId
            );

            if (existingAssignment) {
                showNotice("error", "This module is already assigned to that user.");
                return;
            }

            await createAssignment({
                userId: selectedUserId,
                moduleId,
                dueDate,
            });

            showNotice("success", "Module assigned successfully.");

            setDueDatesByModuleId((currentDueDates) => {
                const nextDueDates = { ...currentDueDates };
                delete nextDueDates[moduleId];
                return nextDueDates;
            });

            await fetchAssignments();
            await fetchAllAssignments();
        } catch (error) {
            showNotice("error", `Could not assign module: ${getErrorMessage(error)}`);
        } finally {
            setAssigningModuleId(null);
        }
    };

    const handleArchiveModule = async (moduleId: string) => {
        if (assigningModuleId || archivingModuleId) {
            return;
        }

        const confirmed = window.confirm(
            "Archive this module? It will be hidden from the dashboard but not deleted."
        );

        if (!confirmed) {
            return;
        }

        setArchivingModuleId(moduleId);

        try {
            await archiveModule(moduleId);

            setDueDatesByModuleId((currentDueDates) => {
                const nextDueDates = { ...currentDueDates };
                delete nextDueDates[moduleId];
                return nextDueDates;
            });

            showNotice("success", "Module archived successfully.");
            await fetchModules();
        } catch (error) {
            showNotice("error", `Could not archive module: ${getErrorMessage(error)}`);
        } finally {
            setArchivingModuleId(null);
        }
    };

    const toggleVersionHistory = async (moduleId: string) => {
        if (expandedVersionHistoryModuleId === moduleId) {
            setExpandedVersionHistoryModuleId(null);
            return;
        }

        setExpandedVersionHistoryModuleId(moduleId);

        if (versionHistoryByModuleId[moduleId]) {
            return;
        }

        setLoadingVersionHistoryModuleId(moduleId);

        try {
            const versions = await getModuleVersions(moduleId);

            setVersionHistoryByModuleId((currentHistory) => ({
                ...currentHistory,
                [moduleId]: versions,
            }));
        } catch (error) {
            showNotice(
                "error",
                `Could not load version history: ${getErrorMessage(error)}`
            );
        } finally {
            setLoadingVersionHistoryModuleId(null);
        }
    };

    const updateSelectedDepartment = (department: string) => {
        setSelectedDepartment(department);
        setSelectedRoleFilter("All");
        setSelectedLocation("All");
    };

    const updateSelectedRoleFilter = (selectedRole: string) => {
        setSelectedRoleFilter(selectedRole);
        setSelectedLocation("All");
    };

    const updateSelectedLocation = (location: string) => {
        setSelectedLocation(location);
    };

    const departmentOptions = useMemo(() => {
        const departments = userDirectory
            .map((user) => user.department)
            .filter((department): department is string => Boolean(department));

        return ["All", ...Array.from(new Set(departments)).sort()];
    }, [userDirectory]);
    const adminTrainingSummaryByUserId = useMemo(() => {
        const summary: Record<string, AdminUserTrainingSummary> = {};

        const ensureSummary = (userId: string) => {
            if (!summary[userId]) {
                summary[userId] = {
                    assignedCount: 0,
                    completedCount: 0,
                    overdueCount: 0,
                };
            }

            return summary[userId];
        };

        const completedAssignmentKeys = new Set(
            allCompletionRecords.map(
                (record) => `${record.user_id}:${record.module_id}:${record.module_version_id}`
            )
        );

        for (const assignment of allAssignments) {
            const userSummary = ensureSummary(assignment.user_id);

            if (
                ["assigned", "in_progress", "overdue", "completed"].includes(
                    assignment.status
                )
            ) {
                userSummary.assignedCount += 1;
            }

            if (assignment.status === "completed") {
                userSummary.completedCount += 1;
            }

            const dueDate = assignment.due_date
                ? new Date(`${assignment.due_date}T00:00:00`)
                : null;

            const today = new Date();
            const todayAtMidnight = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

            const isPastDue =
                dueDate !== null &&
                !Number.isNaN(dueDate.getTime()) &&
                dueDate.getTime() < todayAtMidnight.getTime();

            if (
                assignment.status === "overdue" ||
                (isPastDue && assignment.status !== "completed")
            ) {
                userSummary.overdueCount += 1;
            }
        }

        for (const completionRecord of allCompletionRecords) {
            const userSummary = ensureSummary(completionRecord.user_id);

            const completionKey = `${completionRecord.user_id}:${completionRecord.module_id}:${completionRecord.module_version_id}`;

            if (!completedAssignmentKeys.has(completionKey)) {
                userSummary.completedCount += 1;
            }
        }

        return summary;
    }, [allAssignments, allCompletionRecords]);
    const roleOptions = useMemo(() => {
        const roles = userDirectory
            .filter((user) => {
                if (selectedDepartment === "All") {
                    return true;
                }

                return user.department === selectedDepartment;
            })
            .map((user) => user.role)
            .filter((userRole): userRole is string => Boolean(userRole));

        return ["All", ...Array.from(new Set(roles)).sort()];
    }, [userDirectory, selectedDepartment]);

    const locationOptions = useMemo(() => {
        const locations = userDirectory
            .filter((user) => {
                const departmentMatches =
                    selectedDepartment === "All" || user.department === selectedDepartment;

                const roleMatches =
                    selectedRoleFilter === "All" || user.role === selectedRoleFilter;

                return departmentMatches && roleMatches;
            })
            .map((user) => user.location_code)
            .filter((location): location is string => Boolean(location));

        return ["All", ...Array.from(new Set(locations)).sort()];
    }, [userDirectory, selectedDepartment, selectedRoleFilter]);

    const filteredUserDirectory = useMemo(() => {
        return userDirectory.filter((user) => {
            const departmentMatches =
                selectedDepartment === "All" || user.department === selectedDepartment;

            const roleMatches =
                selectedRoleFilter === "All" || user.role === selectedRoleFilter;

            const locationMatches =
                selectedLocation === "All" || user.location_code === selectedLocation;

            return departmentMatches && roleMatches && locationMatches;
        });
    }, [userDirectory, selectedDepartment, selectedRoleFilter, selectedLocation]);

    const assignedModuleIds = useMemo(() => {
        return new Set(assignments.map((assignment) => assignment.module_id));
    }, [assignments]);

    const completedModuleIds = useMemo(() => {
        return new Set(completionRecords.map((record) => record.module_id));
    }, [completionRecords]);

    const assignmentStatusByModuleId = useMemo(() => {
        return assignments.reduce<Record<string, string>>(
            (statusMap, assignment) => {
                statusMap[assignment.module_id] = assignment.status;
                return statusMap;
            },
            {}
        );
    }, [assignments]);

    const visibleCourses = useMemo(() => {
        if (role === "employee") {
            return courses.filter((course) => assignedModuleIds.has(course.id));
        }

        return courses;
    }, [courses, role, assignedModuleIds]);

    return {
        role,
        setRole,

        users,
        userDirectory,
        filteredUserDirectory,
        adminTrainingSummaryByUserId,
        departmentOptions,
        roleOptions,
        locationOptions,
        selectedDepartment,
        selectedRoleFilter,
        selectedLocation,
        updateSelectedDepartment,
        updateSelectedRoleFilter,
        updateSelectedLocation,

        selectedUserId,
        setSelectedUserId,
        dueDatesByModuleId,

        creatingModule,
        assigningModuleId,
        archivingModuleId,
        editingModuleId,
        updatingModuleId,

        expandedVersionHistoryModuleId,
        loadingVersionHistoryModuleId,
        versionHistoryByModuleId,

        notice,
        dismissNotice,
        loading,

        visibleCourses,
        completedModuleIds,
        assignmentStatusByModuleId,

        handleCreateModule,
        updateDueDateForModule,
        handleAssignModuleToUser,
        handleArchiveModule,
        startEditingModule,
        cancelEditingModule,
        handleUpdateModule,
        toggleVersionHistory,
        selectedAdminUserIds,
        bulkAssignmentModuleId,
        bulkAssignmentDueDate,
        bulkAssigning,
        setBulkAssignmentModuleId,
        setBulkAssignmentDueDate,
        toggleAdminUserSelection,
        selectAllFilteredAdminUsers,
        clearSelectedAdminUsers,
        handleBulkAssignModule,
        selectedAdminUserForDetails,
        adminUserTrainingDetails,
        loadingAdminUserTrainingDetails,
        openAdminUserTrainingDetails,
        closeAdminUserTrainingDetails,
    };
}