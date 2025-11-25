import { Test, TestingModule } from '@nestjs/testing';
import { AsignacionReservasController } from './asignacion-reservas.controller';
import { AsignacionReservasService } from './asignacion-reservas.service';

describe('AsignacionReservasController', () => {
  let controller: AsignacionReservasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsignacionReservasController],
      providers: [AsignacionReservasService],
    }).compile();

    controller = module.get<AsignacionReservasController>(
      AsignacionReservasController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
