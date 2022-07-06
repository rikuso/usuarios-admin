import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Configuraciones} from '../config/configuraciones';
import {Credenciales, User} from '../models';
import {UserRepository} from '../repositories';
const fetch = require('node-fetch');
@injectable({scope: BindingScope.TRANSIENT})
export class UsuariosService {
  constructor(
    @repository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  /*
   * Add service methods here
   */

  async validarCredenciales(credenciales: Credenciales) {
    const usuario = await this.userRepository.findOne({
      where: {
        correo: credenciales.usuario,
        clave: credenciales.clave,
      },
    });
    return usuario;
  }

  async crearToke(usuarios: User): Promise<string> {
    //console.log(usuarios._id);
    console.log('creartoken usuario.id : ' + usuarios.rolId);
    const url = `${Configuraciones.url_tokens}?id_usuario=${usuarios._id}&nombre=${usuarios.rolId}`;
    let token = '';
    await fetch(url).then(async (rest: any) => {
      token = await rest.json();
    });
    console.log('este es el tojke :' + token);
    return token;
  }
}
