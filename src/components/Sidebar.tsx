import { memo } from "react";
import styles from "./Sidebar.module.css";

interface Project {
  id: string;
  name: string;
  color: string;
}
interface SidebarProps {
  projects: Project[];
  isOpen: boolean;
  onRename: (project: Project) => void;
  onDelete: (id: string) => void;
  onSelectProject: (id: string) => void;
  selectedProjectId: string | null;
}

function Sidebar({
  projects,
  isOpen,
  onRename,
  onDelete,
  onSelectProject,
  selectedProjectId,
}: SidebarProps) {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      <h2 className={styles.title}>Mes Projets</h2>
      <ul className={styles.list}>
        {projects.map((p) => (
          <li key={p.id}>
            <div
              onClick={() => onSelectProject(p.id)}
              className={`${styles.item} ${selectedProjectId === p.id ? styles.active : ""}`}
            >
              <span className={styles.dot} style={{ background: p.color }} />
              <span className={styles.projectName}>{p.name}</span>
              <div className={styles.actions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(p);
                  }}
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(p.id);
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default memo(Sidebar);
