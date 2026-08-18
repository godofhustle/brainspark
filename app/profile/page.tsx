"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarIcon, CreditCardIcon, LogOutIcon, BanIcon } from "lucide-react";

import {
  type UserProfile,
  getCurrentUser,
  getUserProfileByEmail,
  updateUserProfile,
  signOut,
  createUserProfile,
} from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const user = await getCurrentUser();

      if (!user?.email) {
        router.push("/auth/login");
        return;
      }

      if (!user.email_confirmed_at) {
        setLoading(false);
        return;
      }

      let userProfile = await getUserProfileByEmail(user.email);

      if (!userProfile) {
        userProfile = await createUserProfile(user.email, "free");
        if (!userProfile) {
          toast.error("Не удалось создать профиль");
          router.push("/auth/login");
          return;
        }
      }

      setProfile(userProfile);
      setVerified(true);
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSubscriptionTypeText = (type: string) => {
    switch (type) {
      case "free":
        return "Бесплатная";
      case "basic":
        return "Базовая";
      case "premium":
        return "Премиум";
      default:
        return type;
    }
  };

  const isSubscriptionExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const { error } = await signOut();
      if (error) throw new Error(error.message);
      toast.success("Вы успешно вышли из аккаунта");
      router.push("/auth/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast.error("Не удалось выйти из аккаунта");
      setIsSigningOut(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!profile?.id) return;

    setIsCancelling(true);

    try {
      const updated = await updateUserProfile(profile.id, { subscription_type: "free" });
      if (!updated) throw new Error("Failed to cancel subscription");

      setProfile(updated);
      toast.success("Подписка успешно отменена");
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast.error("Не удалось отменить подписку");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="h-dvh flex flex-col justify-center items-center w-full stretch bg-background">
        <div className="animate-pulse text-muted-foreground">Загрузка профиля...</div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="h-dvh flex flex-col justify-center items-center w-full stretch bg-background">
        <div className="max-w-md mx-auto text-center space-y-4 px-4">
          <h1 className="text-2xl font-bold">Подтвердите ваш email</h1>
          <p className="text-muted-foreground">
            Для доступа к профилю необходимо подтвердить ваш email адрес. Пожалуйста, проверьте
            вашу почту и перейдите по ссылке подтверждения.
          </p>
          <Button variant="outline" className="mt-4" onClick={handleSignOut}>
            Вернуться на страницу входа
          </Button>
        </div>
      </div>
    );
  }

  const isPaidSubscription = profile?.subscription_type !== "free";
  const isExpired = profile ? isSubscriptionExpired(profile.subscription_ends_at) : false;

  return (
    <div className="h-dvh flex flex-col w-full bg-background">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
          <div className="space-y-8">
            <div className="flex flex-col desktop:flex-row justify-between items-start desktop:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Профиль пользователя</h1>
                <p className="text-muted-foreground mt-1">{profile?.email}</p>
              </div>

              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOutIcon className="h-4 w-4 flex-shrink-0" />
                <span>{isSigningOut ? "Выход..." : "Выйти из аккаунта"}</span>
              </Button>
            </div>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Информация о подписке</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 desktop:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <CreditCardIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Тип подписки</h3>
                      <p className="text-lg font-semibold text-primary">
                        {profile ? getSubscriptionTypeText(profile.subscription_type) : "Не указан"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Срок действия</h3>
                      <p className={`text-lg font-semibold ${isExpired ? "text-red-500" : "text-green-500"}`}>
                        {profile ? formatDate(profile.subscription_ends_at) : "Не указан"}
                        {isExpired && " (истекла)"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href="/profile/subscription" className="flex-1">
                    <Button className="w-full" size="lg">
                      {profile?.subscription_type === "free"
                        ? "Купить подписку"
                        : isExpired
                          ? "Продлить подписку"
                          : "Управлять подпиской"}
                    </Button>
                  </Link>

                  {isPaidSubscription && !isExpired && (
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        size="lg"
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                      >
                        <BanIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{isCancelling ? "Отмена..." : "Отменить подписку"}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
              <p>У вас возникли вопросы? Обратитесь в нашу службу поддержки.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}