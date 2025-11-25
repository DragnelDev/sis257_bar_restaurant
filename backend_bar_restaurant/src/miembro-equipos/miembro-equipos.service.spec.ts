import { Test, TestingModule } from '@nestjs/testing';
import { MiembroEquiposService } from './miembro-equipos.service';

describe('MiembroEquiposService', () => {
  let service: MiembroEquiposService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MiembroEquiposService],
    }).compile();

    service = module.get<MiembroEquiposService>(MiembroEquiposService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
