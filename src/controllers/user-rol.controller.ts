import {repository} from '@loopback/repository';
import {param, get, getModelSchemaRef} from '@loopback/rest';
import {User, Rol} from '../models';
import {UserRepository} from '../repositories';

export class UserRolController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @get('/users/{_id}/rol', {
    responses: {
      '200': {
        description: 'Rol belonging to User',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Rol)},
          },
        },
      },
    },
  })
  async getRol(
    @param.path.string('_id') _id: typeof User.prototype._id,
  ): Promise<Rol> {
    return this.userRepository.rol(_id);
  }
}
