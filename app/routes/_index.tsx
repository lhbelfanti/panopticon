import { useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import { getUserById } from "../services/api/users/users.server";
import { formatUserName } from "../services/api/users/users";
import { Button } from "../components/Button";

export async function loader() {
    const user = await getUserById("1");
    return { user };
}

export default function ExampleIndex() {
    const { t } = useTranslation();
    const { user } = useLoaderData<typeof loader>();

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white">{t("welcome")}</h1>
            <p className="text-xl text-white">{t("greeting")}</p>

            {user && (
                <div className="p-4 bg-white shadow rounded-lg border">
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                        Data from API domain encapsulation:
                    </p>
                    <p className="text-lg text-blue-800">
                        {formatUserName(user)}
                    </p>
                </div>
            )}

            {/* Note: The user needs to place 'dummy-image.png' inside the /public directory */}
            <div>
                <img
                    src="/dummy-image.png"
                    alt="Dummy visualization"
                    className="rounded shadow max-w-xs object-cover"
                />
                <p className="text-sm text-gray-500 mt-2">
                    Place 'dummy-image.png' in /public to render this image.
                </p>
            </div>

            <div>
                <Button onClick={() => alert("Button clicked successfully!")}>
                    Click Me
                </Button>
            </div>
        </div>
    );
}
