import {
  ConflictException,
  Injectable,
  NotFoundException,
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
    const existe = await this.usuariosRepository.findOneBy({
      nombreUsuario: createUsuarioDto.nombreUsuario.trim(),
    });
    if (existe) throw new ConflictException('El usuario ya existe');

    const usuario = new Usuario();
    usuario.nombreUsuario = createUsuarioDto.nombreUsuario.trim();
    usuario.correoElectronico = createUsuarioDto.correoElectronico.trim();
    usuario.rol = createUsuarioDto.rol.trim();
    usuario.activo = createUsuarioDto.activo;
    return this.usuariosRepository.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const nombreUsuario = await this.usuariosRepository.findOneBy({ id });
    if (!nombreUsuario) throw new NotFoundException('El usuario no existe');
    return nombreUsuario;
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const nombreUsuario = await this.findOne(id);
    const usuarioUpdate = Object.assign(nombreUsuario, updateUsuarioDto);
    return this.usuariosRepository.save(usuarioUpdate);
  }

  async remove(id: number): Promise<Usuario> {
    const nombreUsuario = await this.findOne(id);
    return this.usuariosRepository.softRemove(nombreUsuario);
  }
}
