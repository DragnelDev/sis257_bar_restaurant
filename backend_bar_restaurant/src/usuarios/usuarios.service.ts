import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    let usuario = await this.usuariosRepository.findOneBy({
      usuario: createUsuarioDto.usuario.trim(),
    });
    if (usuario) throw new ConflictException('El usuario ya existe');

    usuario = new Usuario();
    usuario.clave = process.env.DEFAULT_PASSWORD ?? '';
    usuario.rol = createUsuarioDto.rol;
    Object.assign(usuario, createUsuarioDto);
    return this.usuariosRepository.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find({
      relations: { empleado: true },
      select: {
        id: true,
        usuario: true,
        rol: true,
        activo: true,
        empleado: {
          id: true,
          nombre: true,
          apellidoMaterno: true,
          apellidoPaterno: true,
        },
      },
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException('El usuario no existe');
    return usuario;
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.findOne(id);
    const usuarioUpdate = Object.assign(usuario, updateUsuarioDto);
    return this.usuariosRepository.save(usuarioUpdate);
  }

  async remove(id: number): Promise<Usuario> {
    const usuario = await this.findOne(id);
    return this.usuariosRepository.softRemove(usuario);
  }

  async validate(usuario: string, clave: string): Promise<Usuario> {
    const usuarioOk = await this.usuariosRepository.findOne({
      where: { usuario },
      select: ['id', 'usuario', 'clave', 'rol', 'activo'],
    });

    if (!usuarioOk) throw new NotFoundException('Usuario inexistente');

    if (!(await usuarioOk?.validatePassword(clave))) {
      throw new UnauthorizedException('Clave incorrecta');
    }

    return usuarioOk;
  }
}
