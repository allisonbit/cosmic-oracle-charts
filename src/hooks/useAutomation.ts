import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AutomationLog {
  id: string;
  agent_type: string;
  action: string;
  details: Record<string, any>;
  status: string;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface ContentDraft {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  category: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  agent_type: string;
  ai_model: string | null;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

export function useAutomationLogs(limit = 50) {
  return useQuery<AutomationLog[]>({
    queryKey: ["automation-logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as AutomationLog[];
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });
}

export function useContentDrafts() {
  return useQuery<ContentDraft[]>({
    queryKey: ["content-drafts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_drafts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as unknown as ContentDraft[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useTriggerAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agent, params }: { agent: "content" | "restructure" | "full"; params?: Record<string, any> }) => {
      const { data, error } = await supabase.functions.invoke(`trigger-${agent}`, {
        body: params || {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-logs"] });
      queryClient.invalidateQueries({ queryKey: ["content-drafts"] });
    },
  });
}

export function usePublishDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draftId: string) => {
      const { data: draft, error: fetchErr } = await supabase
        .from("content_drafts")
        .select("*")
        .eq("id", draftId)
        .single();
      if (fetchErr || !draft) throw new Error("Draft not found");

      const d = draft as unknown as ContentDraft;

      // Insert into blog_articles
      const { error: insertErr } = await supabase.from("blog_articles").insert({
        article_id: `draft-${d.id}`,
        title: d.title,
        slug: d.slug,
        content: d.content,
        meta_title: d.meta_title,
        meta_description: d.meta_description,
        category: d.category,
        source: "agent-draft",
      });
      if (insertErr) throw insertErr;

      // Mark draft as published
      await supabase
        .from("content_drafts")
        .update({ status: "published", published_at: new Date().toISOString() } as any)
        .eq("id", draftId);

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-drafts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-content-stats"] });
    },
  });
}
