import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import { TopBar } from "./components/TopBar";
import History from "./pages/History";
import LogWorkout from "./pages/LogWorkout";
import ManageExercises from "./pages/ManageExercises";
import NotFound from "./pages/NotFound";
import Progress from "./pages/Progress";
import { useAuthStore } from "./store/useAuthStore";
import { useGymStore } from "./store/useGymStore";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, initialize } = useAuthStore();
  const { fetchCloudData } = useGymStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user?.id) {
      fetchCloudData(user.id);
    }
  }, [user?.id, fetchCloudData]);

  return (
    <BrowserRouter>
      <TopBar />
      <main>
        <Routes>
          <Route path="/" element={<LogWorkout />} />
          <Route path="/history" element={<History />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/manage" element={<ManageExercises />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <BottomNav />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
