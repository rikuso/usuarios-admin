import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {
  Credenciales,
  CredencialesCambioClave,
  RecuperarClave,
  User,
} from '../models';
import {UserRepository} from '../repositories';
import {AdministradorDeClavesService} from '../services';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @service(AdministradorDeClavesService)
    public servicioClaves: AdministradorDeClavesService,
  ) {}

  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['_id'],
          }),
        },
      },
    })
    user: Omit<User, '_id'>,
  ): Promise<User> {
    const clave = this.servicioClaves.GenerarClave();
    console.log(clave);
    const claveCifrada = this.servicioClaves.Cifrar(clave);
    console.log(claveCifrada);
    user.clave = claveCifrada;
    return this.userRepository.create(user);
  }

  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @patch('/users/{_id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('_id') _id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(_id, user);
  }

  @put('/users/{_id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.string('_id') _id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(_id, user);
  }

  @del('/users/{_id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('_id') _id: string): Promise<void> {
    await this.userRepository.deleteById(_id);
  }

  /*
  SEGURIDAD
  */
  @post('/identificar-usuario', {
    responses: {
      '200': {
        description: 'identificacion de usuarios',
      },
    },
  })
  async identificar(
    @requestBody() credenciales: Credenciales,
  ): Promise<User | null> {
    const usuario = await this.userRepository.findOne({
      where: {
        correo: credenciales.usuario,
        clave: credenciales.clave,
      },
    });
    if (usuario) {
      // Consumir el MS de token y generar uno nuevo
      // se asignara ese token a la respuesta para el cliente
      usuario.clave = '';
    }
    return usuario;
  }
  @post('/recuperar-clave', {
    responses: {
      '200': {
        description: 'Recupearar clave',
      },
    },
  })
  async recuperarClave(
    @requestBody() credencialesRecuperar: RecuperarClave,
  ): Promise<Boolean> {
    const usuario = await this.userRepository.findOne({
      where: {
        correo: credencialesRecuperar.correo,
      },
    });
    if (usuario) {
      const clave = this.servicioClaves.GenerarClave();
      console.log(clave);
      const claveCifrada = this.servicioClaves.Cifrar(clave);
      console.log(claveCifrada);
      usuario.clave = claveCifrada;
      await this.userRepository.updateById(usuario._id, usuario);
      // Consumir el MS de motificaciones
      // enviar nueva clave por sms
      return true;
    }
    return false;
  }
  @post('/cambiar-clave', {
    responses: {
      '200': {
        description: 'cambiar clave',
      },
    },
  })
  async cambiarClave(
    @requestBody() datos: CredencialesCambioClave,
  ): Promise<Boolean> {
    const usuario = await this.userRepository.findById(datos._id);
    if (usuario) {
      if (usuario.clave == datos.clave_actual) {
        usuario.clave = datos.nueva_clave;
        console.log(datos.nueva_clave);
        await this.userRepository.updateById(datos._id, usuario);
        // enviar email al usuario cambio de contraseña
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
}
