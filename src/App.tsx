import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AppEntryTransition } from './components/AppEntryTransition';
import { AuthGuard } from './components/AuthGuard';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TodoPage from './pages/TodoPage';
import CalendarPage from './pages/CalendarPage';
import PomodoroPage from './pages/PomodoroPage';
import RemindersPage from './pages/RemindersPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import { usePageSeo } from './hooks/usePageSeo';

export default function App() {
  usePageSeo();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route
        path="/app"
        element={
          <AuthGuard>
            <AppEntryTransition>
              <AppLayout />
            </AppEntryTransition>
          </AuthGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="todo" element={<TodoPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="pomodoro" element={<PomodoroPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
