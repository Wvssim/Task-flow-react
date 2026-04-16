import styles from './Header.module.css';
import type { User } from '../features/auth/authSlice';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export default function Header({ user, onLogout, onToggleSidebar }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onToggleSidebar}>☰</button>
        <h1 className={styles.logo}>TaskFlow</h1>
      </div>
      <div className={styles.right}>
        {user && <span className={styles.userName}>{user.name}</span>}
        <button className={styles.logoutBtn} onClick={onLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}