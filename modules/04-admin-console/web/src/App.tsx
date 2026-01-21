import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { QuestionBankPage } from "./questionBank/QuestionBankPage";
import { ImportTaskDetailPage } from "./imports/ImportTaskDetailPage";
import { ImportsListPage } from "./imports/ImportsListPage";
import { AnnouncementsPage } from "./cms/AnnouncementsPage";
import { ExportsPage } from "./exports/ExportsPage";
import { OpsExportsPage } from "./exports/OpsExportsPage";
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
        path="/exports"
        element={
          <RequireAuth>
            <ExportsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/exports-ops"
        element={
          <RequireAuth>
            <OpsExportsPage />
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

