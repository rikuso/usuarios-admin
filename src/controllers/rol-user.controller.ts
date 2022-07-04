import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Rol, User} from '../models';
import {RolRepository} from '../repositories';

export class RolUserController {
  constructor(
    @repository(RolRepository) protected rolRepository: RolRepository,
  ) {}

  @get('/rols/{_id}/users', {
    responses: {
      '200': {
        description: 'Array of Rol has many User',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('_id') _id: string,
    @param.query.object('filter') filter?: Filter<User>,
  ): Promise<User[]> {
    return this.rolRepository.users(_id).find(filter);
  }

  @post('/rols/{_id}/users', {
    responses: {
      '200': {
        description: 'Rol model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  async create(
    @param.path.string('_id') _id: typeof Rol.prototype._id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUserInRol',
            exclude: ['_id'],
            optional: ['rolId'],
          }),
        },
      },
    })
    user: Omit<User, '_id'>,
  ): Promise<User> {
    return this.rolRepository.users(_id).create(user);
  }

  @patch('/rols/{_id}/users', {
    responses: {
      '200': {
        description: 'Rol.User PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('_id') _id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: Partial<User>,
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return this.rolRepository.users(_id).patch(user, where);
  }

  @del('/rols/{_id}/users', {
    responses: {
      '200': {
        description: 'Rol.User DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('_id') _id: string,
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where<User>,
  ): Promise<Count> {
    return this.rolRepository.users(_id).delete(where);
  }
}
