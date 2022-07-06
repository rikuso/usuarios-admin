import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {User} from '../models';

@injectable({scope: BindingScope.TRANSIENT})
export class DuplicidadService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  datosDuplicados(usuario: User): Boolean {
    return true;
  }
}
