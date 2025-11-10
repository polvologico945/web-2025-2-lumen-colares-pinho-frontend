import Navbar from "../components/Navbar";

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <main className="container">
        <h2>Dashboard</h2>
        <p>Resumo das suas interações (simulado).</p>
      </main>
    </>
  );
}
