import { Test, TestingModule } from '@nestjs/testing';
import { AsignacionReservasService } from './asignacion-reservas.service';

describe('AsignacionReservasService', () => {
  let service: AsignacionReservasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsignacionReservasService],
    }).compile();

    service = module.get<AsignacionReservasService>(AsignacionReservasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
