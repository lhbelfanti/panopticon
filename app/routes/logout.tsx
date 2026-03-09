import { redirect } from "react-router";
import { logout } from "~/services/api/auth/index.server";
import { getDataFromSession } from "~/services/api/auth/session.server";

import type { ActionFunctionArgs } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
    const session = await getDataFromSession(request);
    const setCookie = await logout(request, session?.token);

    return redirect("/login", {
        headers: {
            "Set-Cookie": setCookie,
        },
    });
};
