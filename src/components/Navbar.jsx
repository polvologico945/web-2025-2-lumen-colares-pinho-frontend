import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <span className="logo">Lumen</span>
      </div>

      <div className="nav-right">
        <NavLink to="/feed" className="nav-item">Feed</NavLink>
        <NavLink to="/dashboard" className="nav-item">Dashboard</NavLink>
        <NavLink to="/perfil" className="nav-item">Perfil</NavLink>
      </div>
    </nav>
  );
}
