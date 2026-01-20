import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { QuestionBankPage } from "./questionBank/QuestionBankPage";

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
            <PlaceholderPage title="导入管理" />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

