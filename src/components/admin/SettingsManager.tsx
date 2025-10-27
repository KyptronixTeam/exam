import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const SettingsManager = () => {
  const { toast } = useToast();
  const [value, setValue] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const rpc: any = await supabase.rpc('get_setting', { key: 'mcq_passing_percentage' });
        const data = rpc?.data;
        if (data && typeof data.value === 'number') setValue(data.value);
        else if (data && typeof data.value === 'string' && data.value.trim() !== '' && !Number.isNaN(Number(data.value))) setValue(Number(data.value));
        else setValue(90);
      } catch (e) {
        console.warn('Failed to load mcq config, using default', e);
        setValue(90);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (value === '' || Number.isNaN(Number(value))) {
      toast({ title: 'Invalid', description: 'Please enter a valid number', variant: 'destructive' });
      return;
    }
    const v = Number(value);
    if (v < 0 || v > 100) {
      toast({ title: 'Invalid', description: 'Please enter a percentage between 0 and 100', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await supabase.rpc('update_setting', { key: 'mcq_passing_percentage', value: v });
      toast({ title: 'Saved', description: 'Passing percentage updated' });
    } catch (err: any) {
      console.error('Save setting error', err);
      toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Adjust application settings (admin only)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-1">MCQ Passing Percentage</Label>
          <Input type="number" min={0} max={100} value={value === '' ? '' : value} onChange={(e: any) => setValue(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsManager;
