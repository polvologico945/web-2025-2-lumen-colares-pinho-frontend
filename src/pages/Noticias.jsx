import React, { useState, useEffect } from "react";
import {
  getNoticias,
  getHorariosOnibus,
  getOnibusPorTipo,
} from "../api/feedService";

const Noticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [horarios, setHorarios] = useState(null);
  const [horariosFiltrados, setHorariosFiltrados] = useState([]);
  const [filtroOnibus, setFiltroOnibus] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState("todas");

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    filtrarHorarios();
  }, [filtroOnibus, horarios]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [noticiasData, horariosData] = await Promise.all([
        getNoticias(),
        getHorariosOnibus(),
      ]);
      setNoticias(noticiasData);
      setHorarios(horariosData);
      setHorariosFiltrados(horariosData?.horarios || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  const filtrarHorarios = async () => {
    if (!horarios) return;

    if (filtroOnibus === "todos") {
      setHorariosFiltrados(horarios.horarios || []);
    } else {
      try {
        const dados = await getOnibusPorTipo(filtroOnibus);
        setHorariosFiltrados(dados);
      } catch (error) {
        console.error("Erro ao filtrar horários:", error);
      }
    }
  };

  const filtrarPorCategoria = (categoria) => {
    setCategoriaAtiva(categoria);
  };

  const noticiasFiltradas =
    categoriaAtiva === "todas"
      ? noticias
      : noticias.filter((n) => n.categoria === categoriaAtiva);

  const categorias = ["todas", ...new Set(noticias.map((n) => n.categoria))];

  if (carregando) {
    return <div style={styles.loading}>Carregando notícias...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titulo}>📰 Notícias & Informações</h1>
        <p style={styles.subtitulo}>
          Fique por dentro das novidades e serviços
        </p>
      </header>

      {horarios && (
        <div style={styles.cardDestaque}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitulo}>🚌 {horarios.titulo}</h2>
            <div style={styles.badge}>IMPORTANTE</div>
          </div>

          <p style={styles.descricao}>
            Confira os horários atualizados dos ônibus que fazem o trajeto entre
            a Rodoviária e o Campus.
          </p>

          <div style={styles.filtrosContainer}>
            <button
              onClick={() => setFiltroOnibus("todos")}
              style={{
                ...styles.filtroBtn,
                ...(filtroOnibus === "todos" && styles.filtroAtivo),
              }}
            >
              Todos os Horários
            </button>
            <button
              onClick={() => setFiltroOnibus("A")}
              style={{
                ...styles.filtroBtn,
                ...(filtroOnibus === "A" && styles.filtroAtivo),
              }}
            >
              Ônibus A
            </button>
            <button
              onClick={() => setFiltroOnibus("B")}
              style={{
                ...styles.filtroBtn,
                ...(filtroOnibus === "B" && styles.filtroAtivo),
              }}
            >
              Ônibus B
            </button>
          </div>

          <div style={styles.tabelaContainer}>
            <table style={styles.tabela}>
              <thead>
                <tr style={styles.tabelaHeader}>
                  <th style={styles.th}>N° Viagem</th>
                  <th style={styles.th}>Ônibus</th>
                  <th style={styles.th}>Saída Rodoviária</th>
                  <th style={styles.th}>Saída Campus</th>
                </tr>
              </thead>
              <tbody>
                {horariosFiltrados.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      ...styles.tr,
                      backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                    }}
                  >
                    <td style={styles.td}>{item.viagem || index + 1}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badgeOnibus,
                          backgroundColor:
                            item.onibus === "A" ? "#3498db" : "#2ecc71",
                        }}
                      >
                        {item.onibus}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>{item.saidaRodoviaria}</strong>
                    </td>
                    <td style={styles.td}>
                      {item.saidaCampus === "GARAGEM" ? (
                        <span style={styles.garagem}>GARAGEM</span>
                      ) : (
                        item.saidaCampus
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.legenda}>
            <div style={styles.legendaItem}>
              <span
                style={{ ...styles.badgeOnibus, backgroundColor: "#3498db" }}
              >
                A
              </span>
              <span>Ônibus A</span>
            </div>
            <div style={styles.legendaItem}>
              <span
                style={{ ...styles.badgeOnibus, backgroundColor: "#2ecc71" }}
              >
                B
              </span>
              <span>Ônibus B</span>
            </div>
            <div style={styles.legendaItem}>
              <span style={styles.garagem}>GARAGEM</span>
              <span>Retorna à garagem</span>
            </div>
          </div>
        </div>
      )}

      <div style={styles.categoriasContainer}>
        {categorias.map((categoria) => (
          <button
            key={categoria}
            onClick={() => filtrarPorCategoria(categoria)}
            style={{
              ...styles.categoriaBtn,
              ...(categoriaAtiva === categoria && styles.categoriaAtiva),
            }}
          >
            {categoria === "todas" ? "📰 Todas" : `📋 ${categoria}`}
          </button>
        ))}
      </div>

      <div style={styles.noticiasGrid}>
        {noticiasFiltradas.map((noticia) => (
          <div key={noticia.id} style={styles.noticiaCard}>
            {noticia.destaque && (
              <div style={styles.destaqueBadge}>DESTAQUE</div>
            )}
            <img
              src={noticia.imagem}
              alt={noticia.titulo}
              style={styles.noticiaImagem}
            />
            <div style={styles.noticiaContent}>
              <div style={styles.noticiaMeta}>
                <span style={styles.categoria}>{noticia.categoria}</span>
                <span style={styles.data}>
                  {new Date(noticia.dataPublicacao).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <h3 style={styles.noticiaTitulo}>{noticia.titulo}</h3>
              <p style={styles.noticiaResumo}>
                {noticia.conteudo.substring(0, 150)}...
              </p>
              <div style={styles.noticiaFooter}>
                <div style={styles.autor}>
                  <img
                    src={noticia.autor?.avatar}
                    alt={noticia.autor?.nome}
                    style={styles.autorAvatar}
                  />
                  <span>{noticia.autor?.nome}</span>
                </div>
                <div style={styles.stats}>
                  <span style={styles.stat}>👁️ {noticia.visualizacoes}</span>
                  <span style={styles.stat}>❤️ {noticia.curtidas}</span>
                  <span style={styles.stat}>💬 {noticia.comentarios}</span>
                </div>
              </div>
              <button style={styles.lerMaisBtn}>Ler mais →</button>
            </div>
          </div>
        ))}
      </div>

      {noticiasFiltradas.length === 0 && (
        <div style={styles.semNoticias}>
          <p>Nenhuma notícia encontrada para esta categoria.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  titulo: {
    color: "#2c3e50",
    fontSize: "2.5rem",
    marginBottom: "10px",
  },
  subtitulo: {
    color: "#7f8c8d",
    fontSize: "1.1rem",
  },
  cardDestaque: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "30px",
    marginBottom: "40px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitulo: {
    color: "#2c3e50",
    margin: 0,
    fontSize: "1.8rem",
  },
  badge: {
    backgroundColor: "#e74c3c",
    color: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  descricao: {
    color: "#34495e",
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "25px",
  },
  filtrosContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },
  filtroBtn: {
    padding: "10px 20px",
    border: "2px solid #3498db",
    backgroundColor: "white",
    color: "#3498db",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.3s",
  },
  filtroAtivo: {
    backgroundColor: "#3498db",
    color: "white",
  },
  tabelaContainer: {
    overflowX: "auto",
    marginBottom: "20px",
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
  },
  tabelaHeader: {
    backgroundColor: "#2c3e50",
    color: "white",
  },
  th: {
    padding: "15px",
    textAlign: "left",
    fontWeight: "bold",
  },
  tr: {
    borderBottom: "1px solid #eee",
  },
  td: {
    padding: "15px",
    textAlign: "left",
  },
  badgeOnibus: {
    display: "inline-block",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    color: "white",
    textAlign: "center",
    lineHeight: "30px",
    fontWeight: "bold",
  },
  garagem: {
    backgroundColor: "#f39c12",
    color: "white",
    padding: "5px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  legenda: {
    display: "flex",
    gap: "20px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  legendaItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#7f8c8d",
  },
  categoriasContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  categoriaBtn: {
    padding: "10px 20px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    color: "#34495e",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s",
  },
  categoriaAtiva: {
    backgroundColor: "#3498db",
    color: "white",
    borderColor: "#3498db",
  },
  noticiasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "30px",
  },
  noticiaCard: {
    backgroundColor: "white",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    transition: "transform 0.3s",
    position: "relative",
    ":hover": {
      transform: "translateY(-5px)",
    },
  },
  destaqueBadge: {
    position: "absolute",
    top: "15px",
    left: "15px",
    backgroundColor: "#e74c3c",
    color: "white",
    padding: "5px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: 1,
  },
  noticiaImagem: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  noticiaContent: {
    padding: "20px",
  },
  noticiaMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "14px",
  },
  categoria: {
    color: "#3498db",
    fontWeight: "bold",
  },
  data: {
    color: "#95a5a6",
  },
  noticiaTitulo: {
    fontSize: "18px",
    color: "#2c3e50",
    margin: "10px 0",
    lineHeight: "1.4",
  },
  noticiaResumo: {
    color: "#7f8c8d",
    lineHeight: "1.6",
    marginBottom: "20px",
  },
  noticiaFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  autor: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  autorAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
  },
  stats: {
    display: "flex",
    gap: "15px",
  },
  stat: {
    fontSize: "14px",
    color: "#95a5a6",
  },
  lerMaisBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#3498db",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    padding: 0,
    ":hover": {
      textDecoration: "underline",
    },
  },
  semNoticias: {
    textAlign: "center",
    padding: "50px",
    color: "#7f8c8d",
    fontSize: "18px",
    gridColumn: "1 / -1",
  },
  loading: {
    textAlign: "center",
    padding: "100px",
    fontSize: "20px",
    color: "#7f8c8d",
  },
};

export default Noticias;
