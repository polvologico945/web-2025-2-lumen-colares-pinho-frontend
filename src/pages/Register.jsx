import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!/@/.test(form.email)) return setError("Digite um e-mail válido.");
    if (form.password.length < 4) return setError("Senha deve ter pelo menos 4 caracteres.");
    if (form.password !== form.confirm) return setError("As senhas não coincidem.");

    alert("Conta criada com sucesso! (Por enquanto é só visual 😄)");
    navigate("/");
  }

  return (
    <div className="page-center">
      <div className="card-panel auth">
        <Logo size={90} />

        <p className="muted">Crie sua conta para entrar na Lumen.</p>

        <form onSubmit={handleRegister} className="form">
          <label>Email</label>
          <input type="email" name="email" onChange={handleChange} />

          <label>Senha</label>
          <input type="password" name="password" onChange={handleChange} />

          <label>Confirmar senha</label>
          <input type="password" name="confirm" onChange={handleChange} />

          {error && <div className="error">{error}</div>}

          <button className="btn">Criar conta</button>
        </form>

        <div className="register-hint">
          Já tem conta? <span className="register-link" onClick={() => navigate("/")}>Entrar</span>
        </div>
      </div>
    </div>
  );
}
