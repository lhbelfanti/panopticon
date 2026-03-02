import { useState } from "react";
import {
    data,
    redirect,
    useActionData,
    useLoaderData,
    useNavigation,
    useParams,
} from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, PlusCircle, TableProperties } from "lucide-react";
import { Link } from "react-router";

import { getProjectById } from "~/services/api/projects/index.server";
import { addEntriesToProject } from "~/services/api/entries/index.server";
import { EntryForm } from "~/components/EntryIngestion/EntryForm";
import { BulkUpload } from "~/components/EntryIngestion/BulkUpload";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { id } = params;
    if (!id) throw new Response("Not Found", { status: 404 });

    const project = await getProjectById(parseInt(id));
    if (!project) throw new Response("Not Found", { status: 404 });

    return { project };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { id } = params;
    if (!id) throw new Response("Not Found", { status: 404 });

    const project = await getProjectById(parseInt(id));
    if (!project) throw new Response("Not Found", { status: 404 });

    const formData = await request.formData();
    const textsStr = formData.get("texts") as string;

    if (!textsStr) {
        return data({ error: "No texts provided" }, { status: 400 });
    }

    const texts = JSON.parse(textsStr) as string[];
    const modelIds = project.models;

    await addEntriesToProject(project.id, modelIds, texts);

    return redirect(`/projects/${id}`);
};

export default function NewEntriesPage() {
    const { project } = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

    const isSubmitting = navigation.state === "submitting";

    const handleManualSubmit = (text: string) => {
        const formData = new FormData();
        formData.append("texts", JSON.stringify([text]));
        // Use imperative submit or just a hidden form
        const form = document.createElement("form");
        form.method = "post";
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "texts";
        input.value = JSON.stringify([text]);
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
    };

    const handleBulkUpload = (texts: string[]) => {
        const form = document.createElement("form");
        form.method = "post";
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "texts";
        input.value = JSON.stringify(texts);
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
    };

    // Better way to submit in React Router v7 inside a component without <Form>:
    // We can use useFetcher or just a hidden <Form>

    return (
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar">
            <div className="max-w-4xl mx-auto">
                {/* Header/Back Link */}
                <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-2 text-light-gray-70 hover:text-primary transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">{t("projects.entries.backToProject")}</span>
                </Link>

                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-4xl font-extrabold text-white-1 mb-3 tracking-tight">
                        {t("projects.entries.new.title")}
                    </h1>
                    <p className="text-light-gray-70 text-lg">
                        {t("projects.entries.new.subtitle", { name: project.name })}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-8 border border-white/5 max-w-fit">
                    <button
                        onClick={() => setActiveTab("single")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "single"
                                ? "bg-primary text-background-dark shadow-lg shadow-primary/20"
                                : "text-light-gray-70 hover:text-white-1 hover:bg-white/5"
                            }`}
                    >
                        <PlusCircle size={16} />
                        {t("projects.entries.new.tabs.single")}
                    </button>
                    <button
                        onClick={() => setActiveTab("bulk")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "bulk"
                                ? "bg-primary text-background-dark shadow-lg shadow-primary/20"
                                : "text-light-gray-70 hover:text-white-1 hover:bg-white/5"
                            }`}
                    >
                        <TableProperties size={16} />
                        {t("projects.entries.new.tabs.bulk")}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-8 shadow-2xl">
                    {activeTab === "single" ? (
                        <EntryForm onSubmit={handleManualSubmit} isSubmitting={isSubmitting} />
                    ) : (
                        <BulkUpload onUpload={handleBulkUpload} isSubmitting={isSubmitting} />
                    )}
                </div>
            </div>
        </div>
    );
}
