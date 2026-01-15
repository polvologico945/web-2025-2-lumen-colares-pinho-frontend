import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import PostDetails from "./pages/PostDetails";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import NavBar from "./components/NavBar";
import Bus from "./pages/Bus";
import Noticias from "./pages/Noticias";
import CreatePostPage from "./pages/CreatePostPage";

export default function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" || location.pathname === "/registrar";

  return (
    <>
      {!hideNavbar && <NavBar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registrar" element={<Register />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bus" element={<Bus />} />
        <Route path="/noticias" element={<Noticias />} />
        {/* NOVA ROTA */}
        <Route path="/criar-post" element={<CreatePostPage />} />
      </Routes>
    </>
  );
}
