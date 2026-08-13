import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/layout/AppShell";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AuthCallback from "./pages/auth/AuthCallback";
import CheckEmail from "./pages/auth/CheckEmail";
import Onboarding from "./pages/onboarding/Onboarding";
import Dashboard from "./pages/dashboard/Dashboard";
import LessonsHub from "./pages/lessons/LessonsHub";
import LessonPlayer from "./pages/lessons/LessonPlayer";
import ExamHub from "./pages/exam/ExamHub";
import ExamSimulator from "./pages/exam/ExamSimulator";
import ExamResults from "./pages/exam/ExamResults";
import Pricing from "./pages/pricing/Pricing";
import Profile from "./pages/profile/Profile";
import NotFound from "./pages/NotFound";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/check-email" element={<CheckEmail />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route path="/dashboard" element={<Shell><Dashboard /></Shell>} />
      <Route path="/lessons/:skillArea" element={<Shell><LessonsHub /></Shell>} />
      <Route path="/lessons/:skillArea/:lessonId" element={<Shell><LessonPlayer /></Shell>} />
      <Route path="/exam" element={<Shell><ExamHub /></Shell>} />
      <Route
        path="/exam/run/:attemptId"
        element={
          <ProtectedRoute>
            <ExamSimulator />
          </ProtectedRoute>
        }
      />
      <Route path="/exam/results/:attemptId" element={<Shell><ExamResults /></Shell>} />
      <Route path="/profile" element={<Shell><Profile /></Shell>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
