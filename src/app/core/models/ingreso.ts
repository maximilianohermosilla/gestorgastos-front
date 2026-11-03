import { CategoriaIngreso } from './categoria-ingreso';

/** Ingreso. */
export interface Ingreso {
  id: number;
  valor: number;
  descripcion: string;
  fecha: string;
  periodo?: string;
  idUsuario: number;
  idCategoriaIngreso: number;
  categoriaIngresoNombre?: string;
  categoriaIngreso?: CategoriaIngreso;
}
