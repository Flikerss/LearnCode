import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RouteFallback from "./components/Skeleton/RouteFallback.jsx";

const Home = lazy(() => import("./pages/Home/Home"));
const About = lazy(() => import("./pages/About/About"));
const SignIn = lazy(() => import("./pages/SignIn/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp/SignUp"));
const Lessons = lazy(() => import("./pages/Lessons/Lessons"));
const LessonPage = lazy(() => import("./pages/LessonPage/LessonPage"));
const Profile = lazy(() => import("./pages/Profile/Profile"));

// Unified route fallback to avoid duplicate loaders. Page-level skeletons handle data loading.

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ["/profile"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<RouteFallback />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<RouteFallback />}>
              <SignIn />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<RouteFallback />}>
              <SignUp />
            </Suspense>
          }
        />
        <Route
          path="/lessons"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Lessons />
            </Suspense>
          }
        />
        <Route
          path="/lessons/:lessonId"
          element={
            <Suspense fallback={<RouteFallback />}>
              <LessonPage />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<RouteFallback />}>
                <Profile />
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
