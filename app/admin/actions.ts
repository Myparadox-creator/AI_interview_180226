"use server";

import { cookies } from "next/headers";

const ADMIN_EMAIL = "interviewadmin@gmail.com";
const ADMIN_PASSWORD = "Admin@Interview2025";

export async function validateAdminLogin(email: string, password: string): Promise<boolean> {
    const envEmail = process.env.ADMIN_EMAIL?.trim();
    const envPassword = process.env.ADMIN_PASSWORD?.trim();

    const validEmail = envEmail || ADMIN_EMAIL;
    const validPassword = envPassword || ADMIN_PASSWORD;

    const isValid = email.trim() === validEmail && password.trim() === validPassword;

    if (isValid) {
        // Set a secure httpOnly session cookie so the dashboard can verify access
        const cookieStore = await cookies();
        cookieStore.set("admin_session", "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 8, // 8 hours
            path: "/",
        });
    }

    return isValid;
}

export async function checkAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get("admin_session")?.value === "authenticated";
}
