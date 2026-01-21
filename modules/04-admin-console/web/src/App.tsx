import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { QuestionBankPage } from "./questionBank/QuestionBankPage";
import { ImportTaskDetailPage } from "./imports/ImportTaskDetailPage";
import { ImportsListPage } from "./imports/ImportsListPage";
import { AnnouncementsPage } from "./cms/AnnouncementsPage";
import { AnnouncementDetailPage } from "./cms/AnnouncementDetailPage";
import { ExportsPage } from "./exports/ExportsPage";
import { OpsExportsPage } from "./exports/OpsExportsPage";
import { SvipCodesPage } from "./svip/SvipCodesPage";
import { DashboardPage } from "./dashboard/DashboardPage";
import { PlansPage } from "./plans/PlansPage";
import { HomeSlotsPage } from "./homeSlots/HomeSlotsPage";
import { OrderDetailPage } from "./orders/OrderDetailPage";
import { OrdersPage } from "./orders/OrdersPage";
import { BannersPage } from "./banners/BannersPage";

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
        path="/cms/:id"
        element={
          <RequireAuth>
            <AnnouncementDetailPage />
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
        path="/svip-codes"
        element={
          <RequireAuth>
            <SvipCodesPage />
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
        path="/plans"
        element={
          <RequireAuth>
            <PlansPage />
          </RequireAuth>
        }
      />
      <Route
        path="/home-slots"
        element={
          <RequireAuth>
            <HomeSlotsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/orders"
        element={
          <RequireAuth>
            <OrdersPage />
          </RequireAuth>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <RequireAuth>
            <OrderDetailPage />
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
    </Routes>
  );
}

