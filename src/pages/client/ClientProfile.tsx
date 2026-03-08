import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

export default function ClientProfile() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", company: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile({ name: data.name || "", email: data.email || "", phone: data.phone || "", company: data.company || "" });
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: profile.name, phone: profile.phone, company: profile.company, updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Profile updated", description: "Your profile has been saved." }); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">My Profile</h1>
      <div className="rounded-xl bg-card border card-shadow p-6 max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="rounded-sm" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label><Input value={profile.email} disabled className="rounded-sm bg-muted" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+254 700 000 000" className="rounded-sm" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Company</label><Input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} placeholder="Your company" className="rounded-sm" /></div>
          <Button type="submit" disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
