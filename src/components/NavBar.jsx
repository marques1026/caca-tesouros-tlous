import { NavLink, useLocation } from 'react-router-dom';
import Icone from './Icone.jsx';
import styles from './NavBar.module.css';

const itensNav = [
  { para: '/mapa', rotulo: 'Mapa', icone: 'mapa' },
  { para: '/inventario', rotulo: 'Pistas', icone: 'mochila' },
  { para: '/enigma-final', rotulo: 'Enigma', icone: 'cadeado' },
];

export default function NavBar() {
  const { pathname } = useLocation();
  const ocultar = ['/', '/conclusao'].includes(pathname) || pathname.startsWith('/quiz/');

  if (ocultar) return null;

  return (
    <nav className={styles.barra} aria-label="Navegação principal">
      {itensNav.map(({ para, rotulo, icone }) => (
        <NavLink
          key={para}
          to={para}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.ativo : ''}`
          }
          aria-current={pathname === para ? 'page' : undefined}
        >
          <Icone nome={icone} className={styles.icone} />
          <span className={styles.rotulo}>{rotulo}</span>
        </NavLink>
      ))}
    </nav>
  );
}
