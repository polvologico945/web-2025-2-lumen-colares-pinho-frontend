import { Link, useLocation, useNavigate } from "react-router-dom";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    navigate("/");
  }

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/feed" className="nav-logo">LUMEN</Link>
      </div>

      <div className="nav-right">
        <Link className={`nav-item ${location.pathname === "/feed" ? "active" : ""}`} to="/feed">Feed</Link>
        <Link className={`nav-item ${location.pathname === "/dashboard" ? "active" : ""}`} to="/dashboard">Dashboard</Link>
        <Link className={`nav-item ${location.pathname.includes("/user") ? "active" : ""}`} to="/user/1">Perfil</Link>

        {/* Botão Sair */}
        <button className="nav-logout" onClick={handleLogout}>Sair</button>
      </div>
    </nav>
  );
}
