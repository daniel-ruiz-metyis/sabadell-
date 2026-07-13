import { useState } from "react";
import { FilterBar } from "./components/FilterBar.jsx";
import { useFilters } from "./FilterContext.jsx";
import sabadellLogo from "./assets/sabadell-logo.png";
import {
  IconFunnel,
  IconStamp,
  IconCheck,
  IconLock,
  IconMega,
} from "./components/icons.jsx";

import Renovacion from "./pages/Renovacion.jsx";
import Estampacion from "./pages/Estampacion.jsx";
import Activadas from "./pages/Activadas.jsx";
import Bloqueadas from "./pages/Bloqueadas.jsx";
import Comunicaciones from "./pages/Comunicaciones.jsx";

const SECTIONS = [
  { id: "renovacion", label: "Proceso de renovación", Icon: IconFunnel, Page: Renovacion,
    title: "Estado del proceso de renovación" },
  { id: "estampacion", label: "Estampación", Icon: IconStamp, Page: Estampacion,
    title: "Seguimiento de la estampación" },
  { id: "activadas", label: "Tarjetas activadas", Icon: IconCheck, Page: Activadas,
    title: "Seguimiento tarjetas activadas" },
  { id: "bloqueadas", label: "Tarjetas bloqueadas", Icon: IconLock, Page: Bloqueadas,
    title: "Seguimiento tarjetas bloqueadas" },
  { id: "comunicaciones", label: "Comunicaciones", Icon: IconMega, Page: Comunicaciones,
    title: "Seguimiento comunicaciones operativas" },
];

export default function App() {
  const [active, setActive] = useState("renovacion");
  const [reloadKey, setReloadKey] = useState(0);
  const { ready, reloadCombos } = useFilters();

  const section = SECTIONS.find((s) => s.id === active);
  const Page = section.Page;
  const reload = () => {
    reloadCombos();
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="app">
      <div className="brand">
        <img src={sabadellLogo} alt="Banco Sabadell" className="brand-logo" />
        <div className="brand-sub">Cuadro de mando</div>
      </div>

      <div className="topbar">
        <span className="topbar-title">
          Renovación de tarjetas · Operaciones · Ejercicio en curso
        </span>
        <span className="topbar-title num">daniel.ruiz@metyis.com</span>
      </div>

      <nav className="rail" aria-label="Secciones">
        <div className="rail-eyebrow">Renovación de tarjetas</div>
        {SECTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-item ${active === id ? "active" : ""}`}
            aria-current={active === id ? "page" : undefined}
            onClick={() => setActive(id)}
          >
            <Icon className="nav-ic" />
            {label}
          </button>
        ))}
      </nav>

      <main className="main">
        <div className="page-head">
          <h1 className="page-title">{section.title}</h1>
        </div>

        <FilterBar onReload={reload} />

        {ready ? <Page key={reloadKey} /> : <div className="loading">Cargando…</div>}

        <div className="footer-note">
          Uso Interno. Prohibida su difusión sin consentimiento por escrito de Banco de
          Sabadell, S.A. · Cuadro de mando MVP · datos de muestra editables vía CSV.
        </div>
      </main>
    </div>
  );
}
