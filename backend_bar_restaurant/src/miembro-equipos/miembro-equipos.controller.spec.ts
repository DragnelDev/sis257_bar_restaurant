import { Test, TestingModule } from '@nestjs/testing';
import { MiembroEquiposController } from './miembro-equipos.controller';
import { MiembroEquiposService } from './miembro-equipos.service';

describe('MiembroEquiposController', () => {
  let controller: MiembroEquiposController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MiembroEquiposController],
      providers: [MiembroEquiposService],
    }).compile();

    controller = module.get<MiembroEquiposController>(MiembroEquiposController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
