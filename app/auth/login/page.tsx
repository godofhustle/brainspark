"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Пожалуйста, введите email и пароль");
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        const result = await signUpWithEmail(email, password);
        if (result.error) throw new Error(result.error.message);
        toast.success("Регистрация успешна! Проверьте вашу почту для подтверждения.");
        router.push("/profile");
      } else {
        const result = await signInWithEmail(email, password);
        if (result.error) throw new Error(result.error.message);
        toast.success("Вход выполнен успешно!");
        router.push("/");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.error) throw new Error(result.error.message);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка входа через Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-dvh flex flex-col w-full bg-background">
      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto w-full px-4 sm:px-0 py-16">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold">
                {isRegister ? "Регистрация" : "Вход в аккаунт"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isRegister
                  ? "Создайте аккаунт для доступа к платформе"
                  : "Войдите в свой аккаунт для продолжения"}
              </p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between w-full">
                  <Label htmlFor="password" className="block">
                    Пароль
                  </Label>
                  {!isRegister && (
                    <Link href="/auth/reset-password" className="text-sm text-primary hover:underline">
                      Забыли пароль?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={isRegister ? "Создайте пароль" : "Введите пароль"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Загрузка..." : isRegister ? "Зарегистрироваться" : "Войти"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">или</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.18 3.32v2.77h3.54c2.07-1.9 3.28-4.72 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.97 7.28-2.66l-3.54-2.77c-.98.66-2.23 1.06-3.74 1.06-2.88 0-5.32-1.94-6.19-4.55H2.23v2.86A10.96 10.96 0 0 0 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.81 14.08A6.57 6.57 0 0 1 5.5 12c0-.73.1-1.44.31-2.08V7.06H2.23A10.96 10.96 0 0 0 1 12c0 1.75.41 3.41 1.23 4.92l3.58-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.37c1.62 0 3.09.56 4.23 1.64l3.1-3.1C17.46 2.14 14.97 1 12 1A10.96 10.96 0 0 0 2.23 7.06l3.58 2.84C6.68 7.29 9.12 5.37 12 5.37z"
                  fill="#EA4335"
                />
              </svg>
              Войти через Google
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => setIsRegister(!isRegister)}
                disabled={isLoading}
              >
                {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}