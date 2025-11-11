import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Navbar from "./components/Navbar";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
import Lessons from "./pages/Lessons/Lessons"; 
import LessonPage from "./pages/LessonPage/LessonPage"; 
import Profile from "./pages/Profile/Profile";


function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ["/profile"]; 
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/lessons" element={<Lessons />} /> 
        <Route path="/lessons/:lessonId" element={<LessonPage />} /> 
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
