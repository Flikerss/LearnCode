import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Navbar from "./components/Navbar";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
import Lessons from "./pages/Lessons/Lessons"; 
import LessonPage from "./pages/LessonPage/LessonPage"; 

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/lessons" element={<Lessons />} /> 
        <Route path="/lessons/:lessonId" element={<LessonPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
