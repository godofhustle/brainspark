import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required",
      );
    }

    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  return client;
}

export type ChatMessage = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

export type Chat = {
  id?: string;
  user_id?: string;
  title: string;
  messages: ChatMessage[];
  created_at?: string;
  updated_at?: string;
};

export type UserProfile = {
  id?: string;
  email: string;
  subscription_type: "free" | "basic" | "premium";
  subscription_ends_at: string;
  created_at?: string;
  updated_at?: string;
};

export type AuthError = {
  message: string;
};

const TRIAL_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

function trialEndDate(): string {
  return new Date(Date.now() + TRIAL_PERIOD_MS).toISOString();
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await getSupabase().auth.signUp({ email, password });

  if (error) {
    return { user: null, error: { message: error.message } };
  }

  if (data.user?.email) {
    await createUserProfile(data.user.email, "free", trialEndDate());
  }

  return { user: data.user, error: null };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });

  if (error) {
    return { user: null, error: { message: error.message } };
  }

  return { user: data.user, error: null };
}

export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await getSupabase().auth.signOut();

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  return user;
}

export async function initUserProfileAfterOAuth(user: User) {
  if (!user.email) {
    throw new Error("User email is required for profile creation");
  }

  const existingProfile = await getUserProfileByEmail(user.email);
  if (existingProfile) {
    return existingProfile;
  }

  return createUserProfile(user.email, "free", trialEndDate());
}

export async function createChat(title: string, messages: ChatMessage[]): Promise<Chat | null> {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  const { data, error } = await getSupabase()
    .from("chats")
    .insert({ title, messages, user_id: user.id })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    return null;
  }

  return data;
}

export async function updateChat(
  id: string,
  title: string,
  messages: ChatMessage[],
): Promise<Chat | null> {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  const { data, error } = await getSupabase()
    .from("chats")
    .update({ title, messages, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating chat:", error);
    return null;
  }

  return data;
}

export async function getChat(id: string): Promise<Chat | null> {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  const { data, error } = await getSupabase()
    .from("chats")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error getting chat:", error);
    return null;
  }

  return data;
}

export async function getAllChats(): Promise<Chat[]> {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  if (!user) {
    console.error("User not authenticated");
    return [];
  }

  const { data, error } = await getSupabase()
    .from("chats")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error getting all chats:", error);
    return [];
  }

  return data || [];
}

export async function deleteChat(id: string): Promise<boolean> {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  if (!user) {
    console.error("User not authenticated");
    return false;
  }

  const { error } = await getSupabase()
    .from("chats")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting chat:", error);
    return false;
  }

  return true;
}

export async function createUserProfile(
  email: string,
  subscription_type: "free" | "basic" | "premium" = "free",
  subscription_ends_at: string = trialEndDate(),
): Promise<UserProfile | null> {
  const existingProfile = await getUserProfileByEmail(email);
  if (existingProfile) {
    return existingProfile;
  }

  const { data, error } = await getSupabase()
    .from("user_profiles")
    .insert({ email, subscription_type, subscription_ends_at })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating user profile:", error);
    return null;
  }

  return data;
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  const { data, error } = await getSupabase()
    .from("user_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting user profile:", error);
    return null;
  }

  return data;
}

export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const { data, error } = await getSupabase()
    .from("user_profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Error getting user profile by email:", error);
    return null;
  }

  return data;
}

export async function updateUserProfile(
  id: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile | null> {
  const { data, error } = await getSupabase()
    .from("user_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    return null;
  }

  return data;
}

export async function deleteUserProfile(id: string): Promise<boolean> {
  const { error } = await getSupabase().from("user_profiles").delete().eq("id", id);

  if (error) {
    console.error("Error deleting user profile:", error);
    return false;
  }

  return true;
}

export async function upgradeSubscription(
  userId: string,
  subscriptionType: "basic" | "premium",
  durationMonths: number = 1,
): Promise<UserProfile | null> {
  const currentProfile = await getUserProfile(userId);
  if (!currentProfile) {
    console.error("Profile not found for upgrade");
    return null;
  }

  const currentEndsAt = new Date(currentProfile.subscription_ends_at);
  const isActive =
    currentEndsAt > new Date() && currentProfile.subscription_type !== "free";

  const newEndDate = isActive ? currentEndsAt : new Date();
  newEndDate.setMonth(newEndDate.getMonth() + durationMonths);

  return updateUserProfile(userId, {
    subscription_type: subscriptionType,
    subscription_ends_at: newEndDate.toISOString(),
  });
}