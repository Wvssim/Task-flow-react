import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import api from "../api/axios";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";
import ProjectForm from "../components/ProjectForm";
import styles from "./Dashboard.module.css";

interface Project {
  id: string;
  name: string;
  color: string;
}

interface Column {
  id: string;
  title: string;
  tasks: string[];
}

export default function Dashboard() {
  const { state: authState, dispatch } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const [projRes, colRes] = await Promise.all([
          api.get("/projects"),
          api.get("/columns"),
        ]);
        setProjects(projRes.data);
        setColumns(colRes.data);
      } catch (e) {
        console.error(e);
        setError("Impossible de charger les donnees");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  async function addProject(name: string, color: string) {
    const { data } = await api.post("/projects", { name, color });
    setProjects((prev) => [...prev, data]);
    setSelectedProjectId(data.id);
  }

  async function renameProject(projectId: string, newName: string) {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      return;
    }

    const existing = projects.find((p) => p.id === projectId);
    if (!existing) {
      return;
    }

    const { data } = await api.put(`/projects/${projectId}`, {
      ...existing,
      name: trimmedName,
    });

    setProjects((prev) => prev.map((p) => (p.id === projectId ? data : p)));
  }

  async function deleteProject(projectId: string) {
    await api.delete(`/projects/${projectId}`);
    setProjects((prev) => {
      const nextProjects = prev.filter((p) => p.id !== projectId);
      if (selectedProjectId === projectId) {
        setSelectedProjectId(nextProjects[0]?.id ?? "");
      }
      return nextProjects;
    });
  }

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.layout}>
      <Header
        title="TaskFlow"
        onMenuClick={() => setSidebarOpen((p) => !p)}
        userName={authState.user?.name}
        onLogout={() => dispatch({ type: "LOGOUT" })}
      />

      <div className={styles.body}>
        <Sidebar projects={projects} isOpen={sidebarOpen} />

        <div className={styles.content}>
          <div className={styles.toolbar}>
            {!showForm ? (
              <button
                className={styles.addBtn}
                onClick={() => setShowForm(true)}
              >
                + Nouveau projet
              </button>
            ) : (
              <ProjectForm
                submitLabel="Creer"
                onSubmit={async (name, color) => {
                  try {
                    await addProject(name, color);
                    setShowForm(false);
                  } catch (e) {
                    console.error(e);
                    setError("Creation du projet impossible");
                  }
                }}
                onCancel={() => setShowForm(false)}
              />
            )}

            {projects.length > 0 && (
              <>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>

                <button
                  className={styles.addBtn}
                  onClick={async () => {
                    const current = projects.find(
                      (p) => p.id === selectedProjectId,
                    );
                    if (!current) {
                      return;
                    }
                    const nextName = window.prompt(
                      "Nouveau nom du projet",
                      current.name,
                    );
                    if (!nextName || nextName.trim() === current.name) {
                      return;
                    }
                    try {
                      await renameProject(selectedProjectId, nextName);
                    } catch (e) {
                      console.error(e);
                      setError("Renommage du projet impossible");
                    }
                  }}
                >
                  Renommer
                </button>

                <button
                  className={styles.addBtn}
                  onClick={async () => {
                    const canDelete = window.confirm("Supprimer ce projet ?");
                    if (!canDelete) {
                      return;
                    }
                    try {
                      await deleteProject(selectedProjectId);
                    } catch (e) {
                      console.error(e);
                      setError("Suppression du projet impossible");
                    }
                  }}
                >
                  Supprimer
                </button>
              </>
            )}
          </div>

          {error && <div className={styles.error}>{error}</div>}
          <MainContent columns={columns} />
        </div>
      </div>
    </div>
  );
}
