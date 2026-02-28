import { Form } from "react-router";
import { useTranslation } from "react-i18next";

export interface NewProjectFormProps {
    actionData: { error?: string } | undefined;
    isSubmitting: boolean;
}

const behaviorsList = ["suicidal_ideation", "depression", "anxiety", "harassment", "hate_speech"];
const modelsList = ["bert_spanish", "roberta_english", "llama3_zero_shot", "svm_baseline"];

export const NewProjectForm = (props: NewProjectFormProps) => {
    const { actionData, isSubmitting } = props;
    const { t } = useTranslation();

    const inputClassName = "w-full bg-sidebar-dark border border-white/10 rounded-lg p-3.5 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:opacity-30 shadow-inner";
    const checkboxLabelClassName = "flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-primary/50 bg-background-dark/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/5 group";
    const checkboxInputClassName = "peer appearance-none w-5 h-5 border-2 border-white/20 rounded bg-transparent checked:bg-primary checked:border-primary transition-all cursor-pointer";

    return (
        <Form method="post" className="p-8 lg:p-10 flex flex-col gap-8">
            {actionData?.error && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-sm font-medium">
                    {actionData.error}
                </div>
            )}

            {/* Name and Description */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-light-gray tracking-wide" htmlFor="name">
                        {t('projects.new.name')}
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className={inputClassName}
                        placeholder={t('projects.new.namePlaceholder')}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-light-gray tracking-wide" htmlFor="description">
                        {t('projects.new.description')}
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        rows={3}
                        className={`${inputClassName} resize-none custom-scrollbar`}
                        placeholder={t('projects.new.descriptionPlaceholder')}
                    />
                </div>
            </div>

            <hr className="border-white/5" />

            {/* Behaviors */}
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white-1">{t('projects.new.behaviorsTitle')}</h3>
                    <p className="text-sm text-light-gray-70 mt-1">{t('projects.new.behaviorsDesc')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {behaviorsList.map((b) => (
                        <label key={b} className={checkboxLabelClassName}>
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    name="behaviors"
                                    value={b}
                                    className={checkboxInputClassName}
                                />
                                <svg className="absolute w-3.5 h-3.5 text-background-dark opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-light-gray-80 text-sm font-medium group-hover:text-white-1 transition-colors">
                                {t(`projects.behaviors.${b}`)}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-white/5" />

            {/* Models */}
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white-1">{t('projects.new.modelsTitle')}</h3>
                    <p className="text-sm text-light-gray-70 mt-1">{t('projects.new.modelsDesc')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modelsList.map((m) => (
                        <label key={m} className={checkboxLabelClassName}>
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    name="models"
                                    value={m}
                                    className={checkboxInputClassName}
                                />
                                <svg className="absolute w-3.5 h-3.5 text-background-dark opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-light-gray-80 text-sm font-medium group-hover:text-white-1 transition-colors">
                                {t(`projects.models.${m}`)}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 mt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 float-right"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin" />
                            <span>{t('projects.new.creating')}</span>
                        </>
                    ) : (
                        <span>{t('projects.new.submit')}</span>
                    )}
                </button>
            </div>
        </Form>
    );
};
