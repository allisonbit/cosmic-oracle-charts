import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, LogOut, Loader2, User } from "lucide-react";
import { toast } from "sonner";

export function MySettings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-lg space-y-8">
      {/* Profile */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Profile</h3>
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{profile?.display_name || user?.id}</p>
            <p className="text-sm text-muted-foreground">Connected via wallet</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Display Name</label>
          <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      {/* Sign out */}
      <div className="pt-6 border-t border-border">
        <Button variant="outline" onClick={signOut} className="gap-2 text-destructive hover:text-destructive">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
