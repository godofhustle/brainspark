"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";

import {
  type UserProfile,
  getCurrentUser,
  getUserProfileByEmail,
  upgradeSubscription,
} from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const subscriptionPlans = [
  {
    id: "free",
    name: "Бесплатная",
    description: "Базовый доступ с ограничениями",
    price: 0,
    features: ["Доступ к основным функциям", "До 50 запросов в день", "Стандартная поддержка"],
    recommended: false,
  },
  {
    id: "basic",
    name: "Базовая",
    description: "Расширенный доступ для активных пользователей",
    price: 590,
    features: [
      "Все функции бесплатного плана",
      "До 300 запросов в день",
      "Приоритетная поддержка",
      "Доступ к расширенным моделям AI",
    ],
    recommended: true,
  },
  {
    id: "premium",
    name: "Премиум",
    description: "Максимальный доступ для профессионалов",
    price: 1490,
    features: [
      "Все функции базового плана",
      "Неограниченное количество запросов",
      "Поддержка 24/7",
      "Доступ ко всем моделям AI",
      "Персональный менеджер",
    ],
    recommended: false,
  },
];

export default function SubscriptionPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const user = await getCurrentUser();

      if (!user?.email) {
        router.push("/auth/login");
        return;
      }

      const userProfile = await getUserProfileByEmail(user.email);

      if (userProfile) {
        setProfile(userProfile);
      } else {
        toast.error("Профиль не найден");
      }

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

  const isSubscriptionExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleUpgradeSubscription = async (planId: "basic" | "premium") => {
    if (!profile?.id) {
      toast.error("Профиль не найден");
      return;
    }

    setProcessingPlan(planId);

    try {
      // TODO: подключить реальный платёжный шлюз
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const updatedProfile = await upgradeSubscription(profile.id, planId, 1);
      if (!updatedProfile) throw new Error("Не удалось обновить подписку");

      setProfile(updatedProfile);
      toast.success(`Подписка успешно обновлена до "${planId === "basic" ? "Базовая" : "Премиум"}"`);
      router.push("/profile");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка при обновлении подписки");
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center w-full bg-background p-4">
        <div className="animate-pulse text-muted-foreground">
          Загрузка информации о подписках...
        </div>
      </div>
    );
  }

  const currentPlanName =
    profile?.subscription_type === "free"
      ? "Бесплатный"
      : profile?.subscription_type === "basic"
        ? "Базовый"
        : "Премиум";

  return (
    <div className="bg-background py-8 px-4 sm:px-6 md:py-12">
      <div className="max-w-5xl mx-auto w-full">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold">Выберите подписку</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Выберите подходящий план подписки для доступа к расширенным возможностям платформы
            </p>

            {profile && (
              <div className="mt-4 inline-flex items-center bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm">
                Текущий план: <span className="font-semibold ml-1">{currentPlanName}</span>
                <span className="mx-2">•</span>
                {isSubscriptionExpired(profile.subscription_ends_at) ? (
                  <span className="text-red-500">Истек</span>
                ) : (
                  <span>До {formatDate(profile.subscription_ends_at)}</span>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`flex flex-col h-full ${plan.recommended ? "border-primary shadow-lg" : ""}`}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="font-bold text-3xl mb-6">
                    {plan.price > 0 ? `${plan.price} ₽` : "Бесплатно"}
                    {plan.price > 0 && (
                      <span className="text-sm font-normal text-muted-foreground"> / месяц</span>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.recommended ? "default" : "outline"}
                    disabled={
                      loading ||
                      processingPlan !== null ||
                      plan.id === profile?.subscription_type ||
                      plan.id === "free"
                    }
                    onClick={() => {
                      if (plan.id === "basic" || plan.id === "premium") {
                        handleUpgradeSubscription(plan.id);
                      }
                    }}
                  >
                    {processingPlan === plan.id
                      ? "Обработка..."
                      : plan.id === profile?.subscription_type
                        ? "Текущий план"
                        : plan.id === "free"
                          ? "Бесплатный план"
                          : "Выбрать план"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              При покупке подписки вы соглашаетесь с нашими условиями использования и политикой
              конфиденциальности.
            </p>
            <p className="mt-1">Вы можете отменить подписку в любое время в настройках вашего профиля.</p>
          </div>
        </div>
      </div>
    </div>
  );
}