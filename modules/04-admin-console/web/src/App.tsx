import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { QuestionBankPage } from "./questionBank/QuestionBankPage";
import { ImportTaskDetailPage } from "./imports/ImportTaskDetailPage";
import { ImportsListPage } from "./imports/ImportsListPage";
import { AnnouncementsPage } from "./cms/AnnouncementsPage";
import { SvipCodesPage } from "./svip/SvipCodesPage";
import { DashboardPage } from "./dashboard/DashboardPage";
import { BannersPage } from "./banners/BannersPage";
import { CoursesPage } from "./courses/CoursesPage";
import { QuestionsPage } from "./questions/QuestionsPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/question-bank"
        element={
          <RequireAuth>
            <QuestionBankPage />
          </RequireAuth>
        }
      />
      <Route
        path="/imports"
        element={
          <RequireAuth>
            <ImportsListPage />
          </RequireAuth>
        }
      />
      <Route
        path="/imports/:taskId"
        element={
          <RequireAuth>
            <ImportTaskDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/cms"
        element={
          <RequireAuth>
            <AnnouncementsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/svip-codes"
        element={
          <RequireAuth>
            <SvipCodesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/banners"
        element={
          <RequireAuth>
            <BannersPage />
          </RequireAuth>
        }
      />
      <Route
        path="/courses"
        element={
          <RequireAuth>
            <CoursesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/questions"
        element={
          <RequireAuth>
            <QuestionsPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

