import { useState } from "react";
import { useAppSelector, useAppDispatch } from '../hooks';
import { logout } from '../features/auth/authSlice';
import useProjects from '../hooks/useProjects';
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";
import ProjectForm from "../components/ProjectForm";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { 
    projects, 
    columns, 
    loading, 
    error, 
    addProject, 
    renameProject, 
    deleteProject,
    selectProject,
    selectedProjectId
  } = useProjects();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);

  if (loading && projects.length === 0) { // Show initial loading only
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.layout}>
      <Header
        user={user}
        onLogout={() => dispatch(logout())}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className={styles.container}>
        <Sidebar
          projects={projects}
          isOpen={sidebarOpen}
          onRename={renameProject}
          onDelete={deleteProject}
          onSelectProject={selectProject}
          selectedProjectId={selectedProjectId}
        />
        <MainContent columns={columns} />
      </div>
      <button className={styles.fab} onClick={() => setShowForm(true)}>+</button>
      {showForm && (
        <ProjectForm
          onClose={() => setShowForm(false)}
          onSubmit={addProject}
        />
      )}
      {error && <div className={styles.errorBanner}>{error}</div>}
    </div>
  );
}
