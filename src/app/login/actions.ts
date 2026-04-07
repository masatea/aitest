"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  console.log("[LOGIN ACTION] authenticate called");

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("[LOGIN ACTION] Attempting signIn for:", email);

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });

    console.log("[LOGIN ACTION] signIn completed (should have redirected)");
    return undefined;
  } catch (error) {
    console.error("[LOGIN ACTION] Error caught:", error);

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "メールアドレスまたはパスワードが正しくありません。";
        default:
          return `認証エラーが発生しました: ${error.type}`;
      }
    }
    // NEXT_REDIRECT エラーは再スローする（正常なリダイレクト）
    throw error;
  }
}
