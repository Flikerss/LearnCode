import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Navbar from "./components/Navbar";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SingUp/SignUp";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
