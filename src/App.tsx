import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/store";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import AreaPecs from "./pages/AreaPecs";
import FortnightSelect from "./pages/FortnightSelect";
import AgendaView from "./pages/AgendaView";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/area/:areaId" element={<AreaPecs />} />
            <Route path="/area/:areaId/pec/:pecId" element={<FortnightSelect />} />
            <Route path="/area/:areaId/pec/:pecId/fortnight/:fortnightId" element={<AgendaView />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
