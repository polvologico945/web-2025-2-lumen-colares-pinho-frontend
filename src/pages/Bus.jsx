import React, { useState, useEffect } from "react";
import { getHorariosOnibus, getOnibusPorTipo } from "../api/feedService";

const Bus = () => {
  const [horarios, setHorarios] = useState(null);
  const [horariosFiltrados, setHorariosFiltrados] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [horaAtual, setHoraAtual] = useState("");

  useEffect(() => {
    carregarHorarios();

    const interval = setInterval(() => {
      const agora = new Date();
      setHoraAtual(
        `${agora.getHours().toString().padStart(2, "0")}h${agora
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
    }, 60000);

    const agora = new Date();
    setHoraAtual(
      `${agora.getHours().toString().padStart(2, "0")}h${agora
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filtrarHorarios();
  }, [filtro, horarios]);

  const carregarHorarios = async () => {
    try {
      setCarregando(true);
      const dados = await getHorariosOnibus();
      setHorarios(dados);
      setHorariosFiltrados(dados?.horarios || []);
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
    } finally {
      setCarregando(false);
    }
  };

  const filtrarHorarios = async () => {
    if (!horarios) return;

    if (filtro === "todos") {
      setHorariosFiltrados(horarios.horarios || []);
    } else if (filtro === "proximos") {
      const horariosFuturos = (horarios.horarios || [])
        .filter((item) => {
          const horaPartida = item.saidaRodoviaria.replace("h", "");
          return horaPartida >= horaAtual.replace("h", "");
        })
        .slice(0, 5);
      setHorariosFiltrados(horariosFuturos);
    } else {
      try {
        const dados = await getOnibusPorTipo(filtro);
        setHorariosFiltrados(dados);
      } catch (error) {
        console.error("Erro ao filtrar:", error);
      }
    }
  };

  const converterHoraParaMinutos = (horaStr) => {
    const [h, m] = horaStr.split("h").map(Number);
    return h * 60 + (m || 0);
  };

  if (carregando) {
    return (
      <div className="page-center">
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Carregando horários de ônibus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center" style={styles.container}>
      <div className="card-panel bus-card" style={styles.headerImage}>
        <img
          src="/src/img/H_O.jpeg"
          alt="Ônibus"
          className="bus-image"
          style={styles.busImage}
        />
        <p className="muted">Acompanhe seu trajeto em tempo real</p>
      </div>

      <div style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.title}>🚌 Horários de Ônibus</h1>
          <p style={styles.subtitle}>Campus UFC Quixadá ↔ Rodoviária</p>
          <div style={styles.horaAtual}>
            <span>
              ⏰ Hora atual: <strong>{horaAtual}</strong>
            </span>
          </div>
        </header>

        {horarios && (
          <div style={styles.infoCard}>
            <h2 style={styles.cardTitle}>{horarios.titulo}</h2>
            <p style={styles.cardDescription}>
              Confira os horários atualizados dos ônibus que fazem o trajeto
              entre a Rodoviária e o Campus. Total de{" "}
              <strong>{horarios.horarios?.length || 0}</strong> horários
              disponíveis.
            </p>
          </div>
        )}

        <div style={styles.filters}>
          <button
            onClick={() => setFiltro("todos")}
            style={{
              ...styles.filterBtn,
              ...(filtro === "todos" && styles.filterActive),
            }}
          >
            🕒 Todos
          </button>
          <button
            onClick={() => setFiltro("proximos")}
            style={{
              ...styles.filterBtn,
              ...(filtro === "proximos" && styles.filterActive),
            }}
          >
            ⏱️ Próximos
          </button>
          <button
            onClick={() => setFiltro("A")}
            style={{
              ...styles.filterBtn,
              ...(filtro === "A" && styles.filterActive),
              backgroundColor: filtro === "A" ? "#3498db" : "white",
              color: filtro === "A" ? "white" : "#3498db",
            }}
          >
            🚍 Ônibus A
          </button>
          <button
            onClick={() => setFiltro("B")}
            style={{
              ...styles.filterBtn,
              ...(filtro === "B" && styles.filterActive),
              backgroundColor: filtro === "B" ? "#2ecc71" : "white",
              color: filtro === "B" ? "white" : "#2ecc71",
            }}
          >
            🚌 Ônibus B
          </button>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Viagem</th>
                <th style={styles.th}>Ônibus</th>
                <th style={styles.th}>Saída Rodoviária</th>
                <th style={styles.th}>Saída Campus</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {horariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.noData}>
                    Nenhum horário encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                horariosFiltrados.map((item, index) => {
                  const horaPartida = converterHoraParaMinutos(
                    item.saidaRodoviaria
                  );
                  const horaAtualMin = converterHoraParaMinutos(horaAtual);
                  const estaAtrasado = horaPartida < horaAtualMin;
                  const proximo =
                    index === 0 &&
                    horaPartida >= horaAtualMin &&
                    horaPartida - horaAtualMin <= 30;

                  return (
                    <tr
                      key={index}
                      style={{
                        ...styles.tr,
                        backgroundColor: proximo
                          ? "#e8f6f3"
                          : index % 2 === 0
                          ? "#f8f9fa"
                          : "white",
                        borderLeft: proximo ? "4px solid #2ecc71" : "none",
                      }}
                    >
                      <td style={styles.td}>
                        <strong>#{item.viagem || index + 1}</strong>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.busBadge,
                            backgroundColor:
                              item.onibus === "A" ? "#3498db" : "#2ecc71",
                          }}
                        >
                          {item.onibus}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.timeCell}>
                          <span style={styles.time}>
                            {item.saidaRodoviaria}
                          </span>
                          {estaAtrasado && (
                            <span style={styles.lateBadge}>⏰</span>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        {item.saidaCampus === "GARAGEM" ? (
                          <span style={styles.garage}>🏠 GARAGEM</span>
                        ) : (
                          <span style={styles.time}>{item.saidaCampus}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {proximo ? (
                          <span style={styles.nextBadge}>🚀 PRÓXIMO</span>
                        ) : estaAtrasado ? (
                          <span style={styles.lateText}>JÁ PASSOU</span>
                        ) : (
                          <span style={styles.onTime}>✓ NO HORÁRIO</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.legend}>
          <h3 style={styles.legendTitle}>📋 Legenda:</h3>
          <div style={styles.legendItems}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.busBadge, backgroundColor: "#3498db" }}>
                A
              </span>
              <span>Ônibus A</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.busBadge, backgroundColor: "#2ecc71" }}>
                B
              </span>
              <span>Ônibus B</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.nextBadge}>🚀 PRÓXIMO</span>
              <span>Próxima partida (≤ 30min)</span>
            </div>
            <div style={styles.legendItem}>
              <span style={styles.garage}>🏠 GARAGEM</span>
              <span>Retorna à garagem</span>
            </div>
          </div>
        </div>

        <div style={styles.infoBox}>
          <h3>ℹ️ Informações Importantes</h3>
          <ul style={styles.infoList}>
            <li>
              Chegue com pelo menos <strong>10 minutos de antecedência</strong>
            </li>
            <li>
              Apresente sua <strong>identificação estudantil</strong>
            </li>
            <li>Em caso de dúvidas, consulte a secretaria do campus</li>
            <li>Horários sujeitos a alterações sem aviso prévio</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1000px",
    width: "100%",
    fontFamily: "Arial, sans-serif",
  },
  headerImage: {
    textAlign: "center",
    marginBottom: "30px",
    padding: "20px",
  },
  busImage: {
    maxWidth: "100%",
    maxHeight: "200px",
    objectFit: "contain",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  mainContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    color: "#2c3e50",
    fontSize: "2.2rem",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#7f8c8d",
    fontSize: "1.2rem",
    marginBottom: "15px",
  },
  horaAtual: {
    backgroundColor: "#3498db",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    display: "inline-block",
    fontSize: "1.1rem",
  },
  infoCard: {
    backgroundColor: "#e3f2fd",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px",
    border: "1px solid #bbdefb",
  },
  cardTitle: {
    color: "#1565c0",
    marginBottom: "10px",
  },
  cardDescription: {
    color: "#37474f",
    lineHeight: "1.6",
  },
  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  filterBtn: {
    padding: "12px 20px",
    border: "2px solid #3498db",
    backgroundColor: "white",
    color: "#3498db",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
  },
  filterActive: {
    backgroundColor: "#3498db",
    color: "white",
  },
  tableContainer: {
    overflowX: "auto",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },
  tableHeader: {
    backgroundColor: "#2c3e50",
    color: "white",
  },
  th: {
    padding: "18px",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "15px",
  },
  tr: {
    borderBottom: "1px solid #eee",
    transition: "background-color 0.3s",
    ":hover": {
      backgroundColor: "#f5f9ff",
    },
  },
  td: {
    padding: "16px",
    textAlign: "left",
    fontSize: "15px",
  },
  busBadge: {
    display: "inline-block",
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    color: "white",
    textAlign: "center",
    lineHeight: "35px",
    fontWeight: "bold",
    fontSize: "16px",
  },
  timeCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  time: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  lateBadge: {
    color: "#e74c3c",
    fontSize: "18px",
  },
  garage: {
    backgroundColor: "#f39c12",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "bold",
  },
  nextBadge: {
    backgroundColor: "#2ecc71",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  lateText: {
    color: "#e74c3c",
    fontSize: "13px",
    fontWeight: "bold",
  },
  onTime: {
    color: "#27ae60",
    fontSize: "13px",
    fontWeight: "bold",
  },
  noData: {
    textAlign: "center",
    padding: "40px",
    color: "#7f8c8d",
    fontSize: "16px",
  },
  legend: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px",
    border: "1px solid #e0e0e0",
  },
  legendTitle: {
    marginBottom: "15px",
    color: "#2c3e50",
  },
  legendItems: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#34495e",
  },
  infoBox: {
    backgroundColor: "#fff3cd",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #ffeaa7",
  },
  infoList: {
    paddingLeft: "20px",
    li: {
      marginBottom: "10px",
      lineHeight: "1.6",
      color: "#856404",
    },
  },
  loading: {
    textAlign: "center",
    padding: "100px",
  },
  spinner: {
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #3498db",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
};

if (typeof document !== "undefined") {
  const styleId = "bus-spin-animation";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

export default Bus;
