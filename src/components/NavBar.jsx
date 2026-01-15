import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const NavBar = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUsuario(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUsuario(null);
    navigate("/");
  };

  return (
    <nav className="nav">
      <Link to="/feed" className="nav-logo">
        LUMEN
      </Link>

      <div className="nav-right">
        <Link to="/feed" className="nav-item">
          Feed
        </Link>
        <Link to="/dashboard" className="nav-item">
          Dashboard
        </Link>

        {usuario && (
          <>
            <Link to={`/user/${usuario.id}`} className="nav-item">
              Perfil
            </Link>
            <button onClick={handleLogout} className="nav-logout">
              Sair
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
