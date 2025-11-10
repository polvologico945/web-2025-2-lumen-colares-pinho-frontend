import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/" className="logo">Lumen</Link>
      <div className="nav-right">
        <Link to="/feed">Explorar</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/perfil">Meu Perfil</Link>
      </div>
    </nav>
  );
}
