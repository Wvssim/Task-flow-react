import { memo } from "react";
import styles from "./MainContent.module.css";

interface Column {
  id: string;
  title: string;
  tasks: string[];
}
interface MainContentProps {
  columns: Column[];
}

function MainContent({ columns }: MainContentProps) {
  return (
    <main className={styles.main}>
      {columns.length === 0 && (
        <p className={styles.emptyState}>
          Aucune colonne pour ce projet. Selectionnez un autre projet ou ajoutez
          des donnees dans le backend.
        </p>
      )}
      <div className={styles.board}>
        {columns.map((col) => (
          <div key={col.id} className={styles.column}>
            <h3 className={styles.colTitle}>
              {col.title} ({col.tasks.length})
            </h3>
            {col.tasks.map((task, i) => (
              <div key={i} className={styles.card}>
                {task}
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}

export default memo(MainContent);
