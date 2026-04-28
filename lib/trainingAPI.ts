import { supabase } from "./supabaseClient";
import type {
  AppUser,
  Assignment,
  CompletionRecord,
  Course,
  ModuleVersion,
  UserDirectoryRecord,
  AdminUserTrainingDetailRecord,
} from "../app/types/training";

export type CreateModuleInput = {
  title: string;
  description: string;
  category: string;
  estimatedMinutes: number;
};
export type AssignModuleToUsersInput = {
    userIds: string[];
    moduleId: string;
    dueDate: string;
};

export type AssignModuleToUsersResult = {
    assignedCount: number;
    skippedCount: number;
};
export type UpdateModuleInput = {
  moduleId: string;
  title: string;
  description: string;
  category: string;
  estimatedMinutes: number;
  content?: string;
};

export type AssignModuleInput = {
  userId: string;
  moduleId: string;
  dueDate: string;
};

export async function getModules(): Promise<Course[]> {
  const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getAssignmentsForUser(
    userId: string
): Promise<Assignment[]> {
  const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["assigned", "in_progress", "overdue", "completed"]);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCompletionRecordsForUser(
    userId: string
): Promise<CompletionRecord[]> {
  const { data, error } = await supabase
      .from("completion_records")
      .select("*")
      .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
export async function getAdminUserTrainingDetails(
    userId: string
): Promise<AdminUserTrainingDetailRecord[]> {
    const { data: assignments, error: assignmentsError } = await supabase
        .from("assignments")
        .select("*")
        .eq("user_id", userId)
        .order("due_date", { ascending: true });

    if (assignmentsError) {
        throw new Error(assignmentsError.message);
    }

    const userAssignments = assignments ?? [];

    if (userAssignments.length === 0) {
        return [];
    }

    const moduleIds = Array.from(
        new Set(userAssignments.map((assignment) => assignment.module_id))
    );

    const lockedVersionIds = Array.from(
        new Set(
            userAssignments
                .map((assignment) => assignment.locked_module_version_id)
                .filter((versionId): versionId is string => Boolean(versionId))
        )
    );

    const [
        modulesResponse,
        versionsResponse,
        completionsResponse,
    ] = await Promise.all([
        supabase.from("modules").select("*").in("id", moduleIds),

        lockedVersionIds.length > 0
            ? supabase.from("module_versions").select("*").in("id", lockedVersionIds)
            : Promise.resolve({ data: [], error: null }),

        supabase
            .from("completion_records")
            .select("*")
            .eq("user_id", userId)
            .in("module_id", moduleIds),
    ]);

    if (modulesResponse.error) {
        throw new Error(modulesResponse.error.message);
    }

    if (versionsResponse.error) {
        throw new Error(versionsResponse.error.message);
    }

    if (completionsResponse.error) {
        throw new Error(completionsResponse.error.message);
    }

    const modulesById = new Map(
        (modulesResponse.data ?? []).map((module) => [module.id, module])
    );

    const versionsById = new Map(
        (versionsResponse.data ?? []).map((version) => [version.id, version])
    );

    const completionRecords = completionsResponse.data ?? [];

    const today = new Date();
    const todayAtMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    return userAssignments.map((assignment) => {
        const module = modulesById.get(assignment.module_id);
        const lockedVersion = assignment.locked_module_version_id
            ? versionsById.get(assignment.locked_module_version_id)
            : null;

        const matchingCompletion = completionRecords.find((record) => {
            if (record.module_id !== assignment.module_id) {
                return false;
            }

            if (assignment.locked_module_version_id) {
                return record.module_version_id === assignment.locked_module_version_id;
            }

            return true;
        });

        const dueDate = assignment.due_date
            ? new Date(`${assignment.due_date}T00:00:00`)
            : null;

        const isPastDue =
            dueDate !== null &&
            !Number.isNaN(dueDate.getTime()) &&
            dueDate.getTime() < todayAtMidnight.getTime();

        const isCompleted = assignment.status === "completed";

        return {
            assignmentId: assignment.id,
            moduleId: assignment.module_id,
            moduleTitle: module?.title ?? "Unknown Module",
            moduleCategory: module?.category ?? null,
            assignmentStatus: assignment.status,
            dueDate: assignment.due_date,
            completedAt: assignment.completed_at ?? matchingCompletion?.completed_at ?? null,
            lockedModuleVersionId: assignment.locked_module_version_id,
            lockedVersionNumber: lockedVersion?.version_number ?? null,
            lockedVersionTitle: lockedVersion?.title ?? null,
            score: matchingCompletion?.score ?? null,
            isOverdue: assignment.status === "overdue" || (isPastDue && !isCompleted),
        };
    });
}
export async function getActiveUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("is_active", true)
      .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function updateModuleAndCreateVersion(
    input: UpdateModuleInput
): Promise<void> {
  const { error: moduleError } = await supabase
      .from("modules")
      .update({
        title: input.title,
        description: input.description,
        category: input.category,
        estimated_minutes: input.estimatedMinutes,
      })
      .eq("id", input.moduleId);

  if (moduleError) {
    throw new Error(moduleError.message);
  }

  const nextVersionNumber = await getNextModuleVersionNumber(input.moduleId);

  const { error: versionError } = await supabase
      .from("module_versions")
      .insert({
        module_id: input.moduleId,
        version_number: nextVersionNumber,
        title: input.title,
        description: input.description,
        content: input.content ?? "",
        status: "published",
        published_at: new Date().toISOString(),
      });

  if (versionError) {
    throw new Error(versionError.message);
  }
}
export async function getLatestDraftModuleVersion(
    moduleId: string
): Promise<ModuleVersion | null> {
  const { data, error } = await supabase
      .from("module_versions")
      .select("*")
      .eq("module_id", moduleId)
      .eq("status", "draft")
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

export async function createDraftFromLatestPublishedVersion(
    moduleId: string
): Promise<ModuleVersion> {
  const latestPublishedVersion = await getLatestPublishedModuleVersion(moduleId);

  if (!latestPublishedVersion) {
    throw new Error("No published version exists to create a draft from.");
  }

  const nextVersionNumber = await getNextModuleVersionNumber(moduleId);

  const { data: draftVersion, error: draftError } = await supabase
      .from("module_versions")
      .insert({
        module_id: moduleId,
        version_number: nextVersionNumber,
        title: latestPublishedVersion.title,
        description: latestPublishedVersion.description,
        content: latestPublishedVersion.content ?? "",
        status: "draft",
        published_at: null,
      })
      .select("*")
      .single();

  if (draftError) {
    throw new Error(draftError.message);
  }

  if (!draftVersion) {
    throw new Error("Draft version was not created.");
  }

  const existingSections = await getSectionsForModuleVersion(
      latestPublishedVersion.id
  );

  if (existingSections.length > 0) {
    const { error: sectionCopyError } = await supabase.from("sections").insert(
        existingSections.map((section) => ({
          module_version_id: draftVersion.id,
          title: section.title,
          content: section.content,
          order_index: section.order_index,
        }))
    );

    if (sectionCopyError) {
      throw new Error(sectionCopyError.message);
    }
  }

  return draftVersion;
}

export async function publishDraftModuleVersion(input: {
  moduleId: string;
  moduleVersionId: string;
}): Promise<void> {
  const { data: draftVersion, error: draftError } = await supabase
      .from("module_versions")
      .select("*")
      .eq("id", input.moduleVersionId)
      .eq("module_id", input.moduleId)
      .eq("status", "draft")
      .maybeSingle();

  if (draftError) {
    throw new Error(draftError.message);
  }

  if (!draftVersion) {
    throw new Error("Draft version was not found.");
  }

  const { error: publishError } = await supabase
      .from("module_versions")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", input.moduleVersionId);

  if (publishError) {
    throw new Error(publishError.message);
  }

  const { error: moduleUpdateError } = await supabase
      .from("modules")
      .update({
        title: draftVersion.title,
        description: draftVersion.description,
      })
      .eq("id", input.moduleId);

  if (moduleUpdateError) {
    throw new Error(moduleUpdateError.message);
  }
}
export async function getLatestPublishedModuleVersion(
    moduleId: string
): Promise<ModuleVersion | null> {
  const { data, error } = await supabase
      .from("module_versions")
      .select("*")
      .eq("module_id", moduleId)
      .eq("status", "published")
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}
export async function getUserDirectory(): Promise<UserDirectoryRecord[]> {
    const { data, error } = await supabase
        .from("user_directory_view")
        .select("*")
        .eq("is_active", true)
        .order("department", { ascending: true })
        .order("role", { ascending: true })
        .order("location_code", { ascending: true })
        .order("name", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}
export async function getNextModuleVersionNumber(
    moduleId: string
): Promise<number> {
  const { data, error } = await supabase
      .from("module_versions")
      .select("version_number")
      .eq("module_id", moduleId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const currentVersionNumber = Number(data?.version_number ?? 0);

  if (Number.isNaN(currentVersionNumber)) {
    throw new Error("Latest module version number is invalid.");
  }

  return currentVersionNumber + 1;
}
export async function getModuleById(moduleId: string): Promise<Course | null> {
  const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("id", moduleId)
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

export async function getActiveAssignmentForUserAndModule(
    userId: string,
    moduleId: string
): Promise<Assignment | null> {
  const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("user_id", userId)
      .eq("module_id", moduleId)
      .in("status", ["assigned", "in_progress", "overdue"])
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

export async function getModuleVersionById(
    moduleVersionId: string
): Promise<ModuleVersion | null> {
  const { data, error } = await supabase
      .from("module_versions")
      .select("*")
      .eq("id", moduleVersionId)
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

export type Section = {
  id: string;
  title: string;
  content: string | null;
  order_index: number;
  module_version_id: string;
};

export async function getSectionsForModuleVersion(
    moduleVersionId: string
): Promise<Section[]> {
  const { data, error } = await supabase
      .from("sections")
      .select("*")
      .eq("module_version_id", moduleVersionId)
      .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function completeAssignedModule(input: {
  userId: string;
  moduleId: string;
  moduleVersionId: string;
  score: number;
}): Promise<void> {
  const completedAt = new Date().toISOString();

  const { error: completionError } = await supabase
      .from("completion_records")
      .upsert(
          {
            user_id: input.userId,
            module_id: input.moduleId,
            module_version_id: input.moduleVersionId,
            score: input.score,
            completed_at: completedAt,
          },
          {
            onConflict: "user_id,module_id,module_version_id",
          }
      );

  if (completionError) {
    throw new Error(completionError.message);
  }

  const { error: assignmentError } = await supabase
      .from("assignments")
      .update({
        status: "completed",
        completed_at: completedAt,
      })
      .eq("user_id", input.userId)
      .eq("module_id", input.moduleId)
      .in("status", ["assigned", "in_progress", "overdue"]);

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }
}
export async function getModuleVersions(
    moduleId: string
): Promise<ModuleVersion[]> {
  const { data, error } = await supabase
      .from("module_versions")
      .select("*")
      .eq("module_id", moduleId)
      .order("version_number", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
export async function createModule(input: CreateModuleInput): Promise<void> {
  const { data: createdModule, error: moduleError } = await supabase
      .from("modules")
      .insert({
        title: input.title,
        description: input.description,
        category: input.category,
        is_required: true,
        estimated_minutes: input.estimatedMinutes,
        is_active: true,
      })
      .select("*")
      .single();

  if (moduleError) {
    throw new Error(moduleError.message);
  }

  if (!createdModule) {
    throw new Error("Module was not created.");
  }

  const { error: versionError } = await supabase.from("module_versions").insert({
    module_id: createdModule.id,
    version_number: 1,
    title: input.title,
    description: input.description,
    content: "",
    status: "published",
    published_at: new Date().toISOString(),
  });

  if (versionError) {
    throw new Error(versionError.message);
  }
}

export async function archiveModule(moduleId: string): Promise<void> {
  const { error } = await supabase
      .from("modules")
      .update({
        is_active: false,
      })
      .eq("id", moduleId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getExistingActiveAssignment(
    userId: string,
    moduleId: string
): Promise<Assignment | null> {
  const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("user_id", userId)
      .eq("module_id", moduleId)
      .in("status", ["assigned", "in_progress", "overdue"])
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}
export async function assignModuleToUsers(
    input: AssignModuleToUsersInput
): Promise<AssignModuleToUsersResult> {
    const uniqueUserIds = Array.from(new Set(input.userIds));

    if (uniqueUserIds.length === 0) {
        return {
            assignedCount: 0,
            skippedCount: 0,
        };
    }

    const latestVersion = await getLatestPublishedModuleVersion(input.moduleId);

    if (!latestVersion) {
        throw new Error(
            "This module does not have a published version yet. Publish a module version before assigning it."
        );
    }

    const { data: existingAssignments, error: existingError } = await supabase
        .from("assignments")
        .select("user_id")
        .eq("module_id", input.moduleId)
        .in("user_id", uniqueUserIds)
        .in("status", ["assigned", "in_progress", "overdue", "completed"]);

    if (existingError) {
        throw new Error(existingError.message);
    }

    const usersWithExistingAssignments = new Set(
        (existingAssignments ?? []).map((assignment) => assignment.user_id)
    );

    const usersToAssign = uniqueUserIds.filter(
        (userId) => !usersWithExistingAssignments.has(userId)
    );

    if (usersToAssign.length === 0) {
        return {
            assignedCount: 0,
            skippedCount: uniqueUserIds.length,
        };
    }

    const { error: insertError } = await supabase.from("assignments").insert(
        usersToAssign.map((userId) => ({
            user_id: userId,
            module_id: input.moduleId,
            locked_module_version_id: latestVersion.id,
            status: "assigned",
            due_date: input.dueDate,
        }))
    );

    if (insertError) {
        throw new Error(insertError.message);
    }

    return {
        assignedCount: usersToAssign.length,
        skippedCount: uniqueUserIds.length - usersToAssign.length,
    };
}
export async function assignModuleToUser(
    input: AssignModuleInput
): Promise<void> {
  const latestVersion = await getLatestPublishedModuleVersion(input.moduleId);

  if (!latestVersion) {
    throw new Error(
        "This module does not have a published version yet. Create or publish a module version before assigning it."
    );
  }

  const { error } = await supabase.from("assignments").insert({
    user_id: input.userId,
    module_id: input.moduleId,
    locked_module_version_id: latestVersion.id,
    status: "assigned",
    due_date: input.dueDate,
  });

  if (error) {
    throw new Error(error.message);
  }
}
export type CreateSectionInput = {
  moduleVersionId: string;
  title: string;
  content: string;
  orderIndex: number;
};

export type UpdateSectionInput = {
  sectionId: string;
  title: string;
  content: string;
  orderIndex: number;
};
export async function getAllAssignments(): Promise<Assignment[]> {
    const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .order("due_date", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}

export async function getAllCompletionRecords(): Promise<CompletionRecord[]> {
    const { data, error } = await supabase
        .from("completion_records")
        .select("*")
        .order("completed_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}
export async function createSection(input: CreateSectionInput): Promise<void> {
  const { error } = await supabase.from("sections").insert({
    module_version_id: input.moduleVersionId,
    title: input.title,
    content: input.content,
    order_index: input.orderIndex,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSection(input: UpdateSectionInput): Promise<void> {
  const { error } = await supabase
      .from("sections")
      .update({
        title: input.title,
        content: input.content,
        order_index: input.orderIndex,
      })
      .eq("id", input.sectionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteSection(sectionId: string): Promise<void> {
  const { error } = await supabase.from("sections").delete().eq("id", sectionId);

  if (error) {
    throw new Error(error.message);
  }
}