export type NavIcon = 'inicio' | 'explorar' | 'reservas';

export interface NavLink {
  texto: string;
  ruta: string;
  icono: NavIcon;
  /** true: el enlace solo se marca activo cuando la ruta coincide por completo (ej. el inicio). */
  exacto: boolean;
}
