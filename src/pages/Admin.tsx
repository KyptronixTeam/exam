import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Home, ClipboardList, HelpCircle, Database, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import kyptronixLogo from '@/assets/kyptronix-logo.png';
import { SubmissionsView } from "@/components/admin/SubmissionsView";
import { QuestionsManager } from "@/components/admin/QuestionsManager";
import { DemoDataLoader } from "@/components/admin/DemoDataLoader";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { PasswordManager } from "@/components/admin/PasswordManager";
import { DashboardManager } from "@/components/admin/DashboardManager";
import { ShieldCheck, LayoutDashboard } from "lucide-react";

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
      const user = await authApi.getUser();

      if (!user) {
        authApi.signOut();
        navigate("/auth");
        return;
      }

      // Check if user has admin role from the fresh user object
      const userRoles = user.roles || [];
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
    authApi.signOut();
    navigate("/auth");
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="border-b shrink-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={kyptronixLogo} alt="Kyptronix Logo" className="h-8 md:h-10 w-auto object-contain" />
            <h1 className="text-xl sm:text-2xl font-bold">Admin Panel</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <Tabs defaultValue="dashboard" className="flex flex-col md:flex-row w-full h-full">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 border-r bg-muted/10 p-4 shrink-0 overflow-y-auto">
            <div className="mb-6 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:block">
              Administration
            </div>
            <TabsList className="flex flex-row md:flex-col h-auto w-full bg-transparent justify-start space-x-2 md:space-x-0 md:space-y-1 p-0 overflow-x-auto">
              <TabsTrigger 
                value="dashboard" 
                className="w-full justify-start text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none px-4 py-2.5 rounded-md transition-colors whitespace-nowrap"
              >
                <LayoutDashboard className="mr-3 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="submissions" 
                className="w-full justify-start text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none px-4 py-2.5 rounded-md transition-colors whitespace-nowrap"
              >
                <ClipboardList className="mr-3 h-4 w-4" />
                Submissions
              </TabsTrigger>
              <TabsTrigger 
                value="questions" 
                className="w-full justify-start text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none px-4 py-2.5 rounded-md transition-colors whitespace-nowrap"
              >
                <HelpCircle className="mr-3 h-4 w-4" />
                MCQ Questions
              </TabsTrigger>
              <TabsTrigger 
                value="demo" 
                className="w-full justify-start text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none px-4 py-2.5 rounded-md transition-colors whitespace-nowrap"
              >
                <Database className="mr-3 h-4 w-4" />
                Demo Data
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="w-full justify-start text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none px-4 py-2.5 rounded-md transition-colors whitespace-nowrap"
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="w-full justify-start text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none px-4 py-2.5 rounded-md transition-colors whitespace-nowrap"
              >
                <ShieldCheck className="mr-3 h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto bg-muted/5 relative">
            <div className="p-4 md:p-8 w-full mx-auto">
              <TabsContent value="dashboard" className="mt-0 h-full border-none p-0 outline-none">
                <DashboardManager />
              </TabsContent>

              <TabsContent value="submissions" className="mt-0 h-full border-none p-0 outline-none">
                <SubmissionsView />
              </TabsContent>

              <TabsContent value="questions" className="mt-0 h-full border-none p-0 outline-none">
                <QuestionsManager />
              </TabsContent>

              <TabsContent value="demo" className="mt-0 h-full border-none p-0 outline-none">
                <DemoDataLoader />
              </TabsContent>

              <TabsContent value="settings" className="mt-0 h-full border-none p-0 outline-none">
                <SettingsManager />
              </TabsContent>

              <TabsContent value="security" className="mt-0 h-full border-none p-0 outline-none">
                <PasswordManager />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
