import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import {
  HomeSkeleton,
  AboutSkeleton,
  LessonsSkeleton,
  LessonPageSkeleton,
  ProfileSkeleton,
  AuthFormSkeleton,
  AdminPanelSkeleton,
} from "./components/Skeletons";

const Home = lazy(() => import("./pages/Home/Home"));
const About = lazy(() => import("./pages/About/About"));
const SignIn = lazy(() => import("./pages/SignIn/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp/SignUp"));
const Lessons = lazy(() => import("./pages/Lessons/Lessons"));
const LessonPage = lazy(() => import("./pages/LessonPage/LessonPage"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const ProfileEditPage = lazy(() => import("./pages/Profile/ProfileEditPage"));
const AdminPanel = lazy(() => import("./pages/Adminpanel/Adminpanel"));

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ["/profile", "/profile/edit"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<HomeSkeleton />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<AboutSkeleton />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<AuthFormSkeleton fields={2} />}>
              <SignIn />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<AuthFormSkeleton fields={3} />}>
              <SignUp />
            </Suspense>
          }
        />
        <Route
          path="/lessons"
          element={
            <Suspense fallback={<LessonsSkeleton />}>
              <Lessons />
            </Suspense>
          }
        />
        <Route
          path="/lessons/:lessonId"
          element={
            <Suspense fallback={<LessonPageSkeleton />}>
              <LessonPage />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<ProfileSkeleton />}>
                <Profile />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <Suspense fallback={<ProfileSkeleton />}>
                <ProfileEditPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin" forbiddenRedirect="/">
              <Suspense fallback={<AdminPanelSkeleton />}>
                <AdminPanel />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
