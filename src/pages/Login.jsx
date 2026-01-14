/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { login } from "../api/authService";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  //Estado de mensagens e controle
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  //Validação em tempo real (onChange)
  function validateField(name, value) {
    const newErrors = { ...errors };

    if (name === "email") {
      if (!value.trim()) {
        newErrors.email = "O e-mail é obrigatório.";
      } else if (!emailRegex.test(value)) {
        newErrors.email = "Digite um e-mail válido.";
      } else {
        delete newErrors.email;
      }
    }

    if (name === "password") {
      if (!value.trim()) {
        newErrors.password = "Senha é obrigatória.";
      } else if (value.length < 4) {
        newErrors.password = "Senha deve ter pelo menos 4 caracteres.";
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  }

  // Atualiza estado e valida ao digitar
  function handleChange(e) {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    validateField(name, value); // validação em tempo real
  }

  //Aqui você conectaremos a API quando quisermos
  async function loginMock({ email, password }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Aceita qualquer credencial válida (não bloqueia por email fixo)
        if (email && password) resolve();
        else reject();
      }, 1000);
    });
  }
  //Validação final ao enviar o formulário
  function validateBeforeSubmit() {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "O e-mail é obrigatório.";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Digite um e-mail válido.";
    }

    if (!form.password.trim()) {
      newErrors.password = "Senha é obrigatória.";
    } else if (form.password.length < 4) {
      newErrors.password = "Senha deve ter pelo menos 4 caracteres.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  //Submit final
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateBeforeSubmit()) return;

    setLoading(true);

    try {
      const res = await login(form);

      // sessão fake (já deixa pronto)
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      navigate("/feed");
    } catch (err) {
      setErrors({ general: "Falha ao entrar. Tente novamente." });
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
          {errors.email && <div className="error">{errors.email}</div>}

          <label>Senha</label>
          <input
            type="password"
            name="password"
            placeholder="mínimo 4 caracteres"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && <div className="error">{errors.password}</div>}

          {/*Erro geral ao tentar login*/}
          {errors.general && <div className="error">{errors.general}</div>}

          {/*Botão*/}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="register-hint">
            Ainda não tem uma conta?{" "}
            <span
              className="register-link"
              onClick={() => navigate("/registrar")}
            >
              Criar conta
            </span>
          </div>
        </form>

        <div className="footer-copy">
          ©️ 2025 Lumen - Todos os direitos reservados
        </div>
      </div>
    </div>
  );
}
