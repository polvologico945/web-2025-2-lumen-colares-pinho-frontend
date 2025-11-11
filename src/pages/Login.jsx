import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function loginMock({ email, password }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === "carlaevelyn20211@gmail.com" && password === "1234") {
          resolve();
        } else {
          reject();
        }
      }, 1000); // simula 1s de delay
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!/@/.test(form.email)) return setError("Digite um e-mail válido.");
    if (form.password.length < 4) return setError("Senha deve ter pelo menos 4 caracteres.");

    setLoading(true);
    try {
      await loginMock(form);
      navigate("/feed");
    } catch (err) {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="card-panel auth">

        <Logo size={125} />

        <p className="muted">Conecte-se com pessoas parecidas com você.</p>

        <form onSubmit={handleSubmit} className="form">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="ex: voce@email.com"
            value={form.email}
            onChange={handleChange}
          />

          <label>Senha</label>
          <input
            type="password"
            name="password"
            placeholder="mínimo 4 caracteres"
            value={form.password}
            onChange={handleChange}
          />

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <div className="register-hint">
            Ainda não tem uma conta? <span className="register-link" onClick={() => navigate("/registrar")}>Criar conta</span>
          </div>

        </form>
        <div className="footer-copy">© 2025 Lumen - Todos os direitos reservados</div>
      </div>
    </div>
  );
}
