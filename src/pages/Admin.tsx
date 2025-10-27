import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SubmissionsView } from "@/components/admin/SubmissionsView";
import { QuestionsManager } from "@/components/admin/QuestionsManager";
import { DemoDataLoader } from "@/components/admin/DemoDataLoader";
import { SettingsManager } from "@/components/admin/SettingsManager";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const userRoles = session.user.roles || [];
      if (!userRoles.includes('admin')) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast({
        title: "Error",
        description: "An error occurred while checking access.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="submissions" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="questions">MCQ Questions</TabsTrigger>
              <TabsTrigger value="demo">Demo Data</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

          <TabsContent value="submissions" className="mt-6">
            <SubmissionsView />
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <QuestionsManager />
          </TabsContent>

          <TabsContent value="demo" className="mt-6">
            <DemoDataLoader />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
