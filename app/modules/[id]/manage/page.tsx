"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    createDraftFromLatestPublishedVersion,
    createSection,
    deleteSection,
    getLatestDraftModuleVersion,
    getLatestPublishedModuleVersion,
    getModuleById,
    getSectionsForModuleVersion,
    publishDraftModuleVersion,
    updateSection,
    type Section,
} from "../../../../lib/trainingAPI";
import type { Course, ModuleVersion } from "../../../types/training";

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown error";
}

export default function ManageModuleContentPage() {
    const params = useParams();
    const moduleId = params.id as string;

    const [module, setModule] = useState<Course | null>(null);
    const [moduleVersion, setModuleVersion] = useState<ModuleVersion | null>(
        null
    );
    const [sections, setSections] = useState<Section[]>([]);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingSection, setSavingSection] = useState(false);
    const [creatingDraft, setCreatingDraft] = useState(false);
    const [publishingDraft, setPublishingDraft] = useState(false);
    const [notice, setNotice] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    useEffect(() => {
        if (!moduleId || typeof moduleId !== "string") {
            return;
        }

        void loadContentManager();
    }, [moduleId]);

    const showNotice = (type: "success" | "error", message: string) => {
        setNotice({
            type,
            message,
        });
    };

    const loadContentManager = async () => {
        setLoading(true);
        setNotice(null);

        try {
            const moduleData = await getModuleById(moduleId);

            if (!moduleData) {
                showNotice("error", "Module not found.");
                return;
            }

            setModule(moduleData);

            const draftVersion = await getLatestDraftModuleVersion(moduleId);
            const selectedVersion =
                draftVersion ?? (await getLatestPublishedModuleVersion(moduleId));

            if (!selectedVersion) {
                showNotice("error", "No module version found.");
                return;
            }

            setModuleVersion(selectedVersion);

            const sectionData = await getSectionsForModuleVersion(selectedVersion.id);
            setSections(sectionData);
        } catch (error) {
            showNotice(
                "error",
                `Could not load content manager: ${getErrorMessage(error)}`
            );
        } finally {
            setLoading(false);
        }
    };

    const refreshSections = async (moduleVersionId: string) => {
        const sectionData = await getSectionsForModuleVersion(moduleVersionId);
        setSections(sectionData);
    };

    const handleCreateDraft = async () => {
        if (creatingDraft || !module) {
            return;
        }

        setCreatingDraft(true);

        try {
            const draftVersion = await createDraftFromLatestPublishedVersion(
                module.id
            );

            setModuleVersion(draftVersion);

            const sectionData = await getSectionsForModuleVersion(draftVersion.id);
            setSections(sectionData);

            showNotice(
                "success",
                `Draft version ${draftVersion.version_number} created. You can now edit sections.`
            );
        } catch (error) {
            showNotice("error", `Could not create draft: ${getErrorMessage(error)}`);
        } finally {
            setCreatingDraft(false);
        }
    };

    const handlePublishDraft = async () => {
        if (!module || !moduleVersion || publishingDraft) {
            return;
        }

        if (moduleVersion.status !== "draft") {
            showNotice("error", "Only draft versions can be published.");
            return;
        }

        const confirmed = window.confirm(
            "Publish this draft? Future assignments will use this version."
        );

        if (!confirmed) {
            return;
        }

        setPublishingDraft(true);

        try {
            await publishDraftModuleVersion({
                moduleId: module.id,
                moduleVersionId: moduleVersion.id,
            });

            showNotice("success", "Draft published successfully.");
            setEditingSectionId(null);
            await loadContentManager();
        } catch (error) {
            showNotice("error", `Could not publish draft: ${getErrorMessage(error)}`);
        } finally {
            setPublishingDraft(false);
        }
    };

    const handleCreateSection = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!moduleVersion || savingSection) {
            return;
        }

        if (moduleVersion.status !== "draft") {
            showNotice("error", "Create a draft before adding sections.");
            return;
        }

        const formElement = event.currentTarget;
        const form = new FormData(formElement);

        const title = String(form.get("title") ?? "").trim();
        const content = String(form.get("content") ?? "").trim();

        if (!title || !content) {
            showNotice("error", "Please enter a section title and content.");
            return;
        }

        setSavingSection(true);

        try {
            await createSection({
                moduleVersionId: moduleVersion.id,
                title,
                content,
                orderIndex: sections.length + 1,
            });

            formElement.reset();
            showNotice("success", "Section added.");
            await refreshSections(moduleVersion.id);
        } catch (error) {
            showNotice("error", `Could not add section: ${getErrorMessage(error)}`);
        } finally {
            setSavingSection(false);
        }
    };

    const handleUpdateSection = async (
        event: React.FormEvent<HTMLFormElement>,
        sectionId: string
    ) => {
        event.preventDefault();

        if (!moduleVersion || savingSection) {
            return;
        }

        if (moduleVersion.status !== "draft") {
            showNotice("error", "Create a draft before editing sections.");
            return;
        }

        const currentSection = sections.find((section) => section.id === sectionId);

        if (!currentSection) {
            showNotice("error", "Section not found.");
            return;
        }

        const formElement = event.currentTarget;
        const form = new FormData(formElement);

        const title = String(form.get("title") ?? "").trim();
        const content = String(form.get("content") ?? "").trim();
        const orderIndex = Number(form.get("order_index"));

        if (!title || !content || !orderIndex) {
            showNotice("error", "Please fill out every section field.");
            return;
        }

        setSavingSection(true);

        try {
            await updateSection({
                sectionId,
                title,
                content,
                orderIndex,
            });

            setEditingSectionId(null);
            showNotice("success", "Section updated.");
            await refreshSections(moduleVersion.id);
        } catch (error) {
            showNotice("error", `Could not update section: ${getErrorMessage(error)}`);
        } finally {
            setSavingSection(false);
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!moduleVersion || savingSection) {
            return;
        }

        if (moduleVersion.status !== "draft") {
            showNotice("error", "Create a draft before deleting sections.");
            return;
        }

        const confirmed = window.confirm(
            "Delete this section from the draft? This cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        setSavingSection(true);

        try {
            await deleteSection(sectionId);
            showNotice("success", "Section deleted.");
            await refreshSections(moduleVersion.id);
        } catch (error) {
            showNotice("error", `Could not delete section: ${getErrorMessage(error)}`);
        } finally {
            setSavingSection(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-5xl mx-auto">
                    <p className="text-slate-600">Loading content manager...</p>
                </div>
            </main>
        );
    }

    if (!module || !moduleVersion) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-5xl mx-auto">
                    <Link href="/" className="text-blue-600 underline">
                        ← Back to Dashboard
                    </Link>

                    <div className="bg-white p-6 rounded shadow mt-6">
                        <p className="text-red-700">
                            Could not load module content manager.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    const isDraft = moduleVersion.status === "draft";
    const actionInProgress = savingSection || creatingDraft || publishingDraft;

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <Link href="/" className="text-blue-600 underline">
                        ← Back to Dashboard
                    </Link>

                    <Link
                        href={`/modules/${module.id}`}
                        className="text-blue-600 underline"
                    >
                        Preview Module →
                    </Link>
                </div>

                <div className="bg-white p-6 rounded shadow mt-6">
                    <div className="flex flex-wrap justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Manage Content
                            </h1>
                            <p className="text-gray-600 mt-2">{module.title}</p>
                        </div>

                        <div className="flex flex-wrap items-start gap-2">
              <span
                  className={`h-fit rounded px-3 py-1 text-sm font-semibold ${
                      isDraft
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                  }`}
              >
                Version {moduleVersion.version_number} — {moduleVersion.status}
              </span>

                            {!isDraft && (
                                <button
                                    type="button"
                                    disabled={creatingDraft}
                                    onClick={() => void handleCreateDraft()}
                                    className="rounded bg-yellow-600 px-4 py-2 text-white disabled:bg-yellow-300 disabled:cursor-not-allowed"
                                >
                                    {creatingDraft ? "Creating Draft..." : "Create Draft"}
                                </button>
                            )}

                            {isDraft && (
                                <button
                                    type="button"
                                    disabled={publishingDraft}
                                    onClick={() => void handlePublishDraft()}
                                    className="rounded bg-green-600 px-4 py-2 text-white disabled:bg-green-300 disabled:cursor-not-allowed"
                                >
                                    {publishingDraft ? "Publishing..." : "Publish Draft"}
                                </button>
                            )}
                        </div>
                    </div>

                    {notice && (
                        <div
                            className={`mt-4 rounded border p-3 text-sm ${
                                notice.type === "success"
                                    ? "border-green-200 bg-green-50 text-green-800"
                                    : "border-red-200 bg-red-50 text-red-800"
                            }`}
                        >
                            {notice.message}
                        </div>
                    )}

                    {!isDraft ? (
                        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                            You are viewing the latest published version. Create a draft to
                            safely edit sections without changing live training content.
                        </div>
                    ) : (
                        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                            You are editing a draft. Employees will not see these changes
                            until you publish this version.
                        </div>
                    )}
                </div>

                <form
                    onSubmit={handleCreateSection}
                    className="bg-white p-6 rounded shadow mt-6"
                >
                    <h2 className="text-xl font-semibold text-gray-800">
                        Add Section
                    </h2>

                    <div className="mt-4 space-y-3">
                        <input
                            name="title"
                            placeholder="Section title"
                            disabled={!isDraft || actionInProgress}
                            className="w-full rounded border border-slate-300 p-2 disabled:bg-slate-100"
                            required
                        />

                        <textarea
                            name="content"
                            placeholder={
                                isDraft
                                    ? "Section content"
                                    : "Create a draft before adding section content"
                            }
                            rows={6}
                            disabled={!isDraft || actionInProgress}
                            className="w-full rounded border border-slate-300 p-2 disabled:bg-slate-100"
                            required
                        />

                        <button
                            type="submit"
                            disabled={!isDraft || actionInProgress}
                            className="rounded bg-green-600 px-4 py-2 text-white disabled:bg-green-300 disabled:cursor-not-allowed"
                        >
                            {savingSection ? "Saving..." : "Add Section"}
                        </button>
                    </div>
                </form>

                <div className="bg-white p-6 rounded shadow mt-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Sections
                    </h2>

                    {sections.length === 0 ? (
                        <p className="mt-4 text-gray-500">
                            No sections have been added yet.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {sections.map((section) => {
                                const isEditing = editingSectionId === section.id;

                                if (isEditing) {
                                    return (
                                        <form
                                            key={section.id}
                                            onSubmit={(event) =>
                                                handleUpdateSection(event, section.id)
                                            }
                                            className="rounded-lg border border-slate-200 p-4"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3">
                                                <input
                                                    name="order_index"
                                                    type="number"
                                                    min="1"
                                                    defaultValue={section.order_index}
                                                    disabled={actionInProgress}
                                                    className="rounded border border-slate-300 p-2 disabled:bg-slate-100"
                                                    required
                                                />

                                                <input
                                                    name="title"
                                                    defaultValue={section.title}
                                                    disabled={actionInProgress}
                                                    className="rounded border border-slate-300 p-2 disabled:bg-slate-100"
                                                    required
                                                />

                                                <textarea
                                                    name="content"
                                                    defaultValue={section.content ?? ""}
                                                    rows={5}
                                                    disabled={actionInProgress}
                                                    className="md:col-span-2 rounded border border-slate-300 p-2 disabled:bg-slate-100"
                                                    required
                                                />
                                            </div>

                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    type="submit"
                                                    disabled={actionInProgress}
                                                    className="rounded bg-green-600 px-4 py-2 text-white disabled:bg-green-300 disabled:cursor-not-allowed"
                                                >
                                                    {savingSection ? "Saving..." : "Save Section"}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={actionInProgress}
                                                    onClick={() => setEditingSectionId(null)}
                                                    className="rounded bg-slate-200 px-4 py-2 text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    );
                                }

                                return (
                                    <div
                                        key={section.id}
                                        className="rounded-lg border border-slate-200 p-4"
                                    >
                                        <div className="flex justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-500">
                                                    Section {section.order_index}
                                                </p>
                                                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                                                    {section.title}
                                                </h3>
                                            </div>

                                            <div className="flex h-fit gap-2">
                                                <button
                                                    type="button"
                                                    disabled={!isDraft || actionInProgress}
                                                    onClick={() => setEditingSectionId(section.id)}
                                                    className="rounded bg-slate-700 px-3 py-2 text-sm text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={!isDraft || actionInProgress}
                                                    onClick={() => handleDeleteSection(section.id)}
                                                    className="rounded bg-red-600 px-3 py-2 text-sm text-white disabled:bg-red-300 disabled:cursor-not-allowed"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <p className="mt-3 whitespace-pre-line text-slate-700">
                                            {section.content}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}