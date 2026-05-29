import Icone from './Icone.jsx';
import styles from './StatusBanner.module.css';

export default function StatusBanner({ online, gpsAtivo }) {
  if (online && gpsAtivo) return null;

  return (
    <aside
      className={styles.banner}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {!online && (
        <p className={styles.item} data-tipo="offline">
          <Icone nome="sinal" className={styles.icone} />
          <span>Modo offline: progresso salvo no dispositivo.</span>
        </p>
      )}
      {!gpsAtivo && (
        <p className={styles.item} data-tipo="gps">
          <Icone nome="bussola" className={styles.icone} />
          <span>GPS desligado: desbloqueio sequencial ativo.</span>
        </p>
      )}
    </aside>
  );
}
