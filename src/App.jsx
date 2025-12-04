import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import PostDetails from "./pages/PostDetails";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import NavBar from "./components/NavBar";

export default function App() {
  const location = useLocation();

  // rotas onde o navbar NÃO deve aparecer
  const hideNavbar = location.pathname === "/" || location.pathname === "/registrar";

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
      </Routes>
    </>
  );
}
