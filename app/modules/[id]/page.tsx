"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    completeAssignedModule,
    getActiveAssignmentForUserAndModule,
    getLatestPublishedModuleVersion,
    getModuleById,
    getModuleVersionById,
    getSectionsForModuleVersion,
    type Section,
} from "../../../lib/trainingAPI";
import type { Course, ModuleVersion } from "../../types/training";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown error";
}

export default function ModuleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const moduleId = params.id as string;

    const [module, setModule] = useState<Course | null>(null);
    const [moduleVersion, setModuleVersion] = useState<ModuleVersion | null>(
        null
    );
    const [sections, setSections] = useState<Section[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [assignmentStatus, setAssignmentStatus] = useState<string | null>(null);
    const [notice, setNotice] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    useEffect(() => {
        if (!moduleId || typeof moduleId !== "string") {
            return;
        }

        void loadModuleDetail();
    }, [moduleId]);

    const showNotice = (type: "success" | "error", message: string) => {
        setNotice({
            type,
            message,
        });
    };

    const loadModuleDetail = async () => {
        setLoading(true);
        setNotice(null);

        try {
            const moduleData = await getModuleById(moduleId);

            if (!moduleData) {
                showNotice("error", "Module not found.");
                return;
            }

            setModule(moduleData);

            const assignment = await getActiveAssignmentForUserAndModule(
                DEMO_USER_ID,
                moduleId
            );
            setAssignmentStatus(assignment?.status ?? null);
            let selectedVersion: ModuleVersion | null = null;

            if (assignment?.locked_module_version_id) {
                selectedVersion = await getModuleVersionById(
                    assignment.locked_module_version_id
                );
            }

            if (!selectedVersion) {
                selectedVersion = await getLatestPublishedModuleVersion(moduleId);
            }

            if (!selectedVersion) {
                showNotice(
                    "error",
                    "No published module version was found for this module."
                );
                return;
            }

            setModuleVersion(selectedVersion);

            const sectionData = await getSectionsForModuleVersion(selectedVersion.id);
            setSections(sectionData);
            setCurrentIndex(0);
        } catch (error) {
            showNotice("error", `Could not load module: ${getErrorMessage(error)}`);
        } finally {
            setLoading(false);
        }
    };

    const nextSection = () => {
        setCurrentIndex((current) => {
            if (current < sections.length - 1) {
                return current + 1;
            }

            return current;
        });
    };

    const completeModule = async () => {
        if (!moduleId || !moduleVersion || completing) {
            return;
        }

        setCompleting(true);

        try {
            await completeAssignedModule({
                userId: DEMO_USER_ID,
                moduleId,
                moduleVersionId: moduleVersion.id,
                score: 100,
            });

            router.push("/");
        } catch (error) {
            showNotice(
                "error",
                `Failed to record completion: ${getErrorMessage(error)}`
            );
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <p className="text-slate-600">Loading module...</p>
                </div>
            </main>
        );
    }

    if (!module) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="text-blue-600 underline">
                        ← Back to Dashboard
                    </Link>

                    <div className="bg-white p-6 rounded shadow mt-6">
                        <p className="text-red-700">Module not found.</p>
                    </div>
                </div>
            </main>
        );
    }

    const currentSection = sections[currentIndex];
    const isAlreadyCompleted = assignmentStatus === "completed";

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="text-blue-600 underline">
                    ← Back to Dashboard
                </Link>

                <div className="bg-white p-6 rounded shadow mt-6">
                    <div className="flex justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                {moduleVersion?.title ?? module.title}
                            </h1>

                            <p className="text-gray-600 mt-2">
                                {moduleVersion?.description ?? module.description}
                            </p>
                        </div>

                        {moduleVersion && (
                            <span className="h-fit rounded bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                Version {moduleVersion.version_number}
              </span>
                        )}
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

                    <hr className="my-6" />

                    {currentSection ? (
                        <div>
                            <div className="mb-4 text-sm text-gray-500">
                                Section {currentIndex + 1} of {sections.length}
                            </div>

                            <h2 className="text-xl font-semibold mb-4">
                                {currentSection.title}
                            </h2>

                            <p className="text-gray-700 mb-6 whitespace-pre-line">
                                {currentSection.content}
                            </p>

                            {isAlreadyCompleted ? (
                                <Link
                                    href="/"
                                    className="inline-block bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Completed — Back to Dashboard
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    disabled={completing}
                                    onClick={() => {
                                        if (currentIndex === sections.length - 1) {
                                            void completeModule();
                                        } else {
                                            nextSection();
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300 disabled:cursor-not-allowed"
                                >
                                    {currentIndex === sections.length - 1
                                        ? completing
                                            ? "Finishing..."
                                            : "Finish"
                                        : "Next"}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-500">
                                No sections found for this module version.
                            </p>

                            {moduleVersion?.content && (
                                <div className="mt-6 rounded border border-slate-200 bg-slate-50 p-4">
                                    <h2 className="text-xl font-semibold mb-4">
                                        Module Content
                                    </h2>
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {moduleVersion.content}
                                    </p>
                                </div>
                            )}

                            {isAlreadyCompleted ? (
                                <Link
                                    href="/"
                                    className="mt-6 inline-block bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Completed — Back to Dashboard
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    disabled={completing}
                                    onClick={() => void completeModule()}
                                    className="mt-6 bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300 disabled:cursor-not-allowed"
                                >
                                    {completing ? "Finishing..." : "Mark Complete"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}