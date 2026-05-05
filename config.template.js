// config.template.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase credentials! Check Netlify environment variables.",
  );
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function submitContactForm(formData) {
  const { data, error } = await supabase.from("contact_messages").insert([
    {
      name: formData.name,
      email: formData.email,
      level: formData.level,
      message: formData.message,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function subscribeNewsletter(email) {
  const { data, error } = await supabase.from("subscribers").insert([
    {
      email: email,
      subscribed_at: new Date().toISOString(),
    },
  ]);

  if (error) throw new Error(error.message);
  return data;
}

export async function getSchoolUpdates() {
  const { data, error } = await supabase
    .from("school_updates")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching updates:", error);
    return [];
  }
  return data;
}
