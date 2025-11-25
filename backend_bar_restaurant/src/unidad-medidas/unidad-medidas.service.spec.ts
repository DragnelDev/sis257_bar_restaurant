import { Test, TestingModule } from '@nestjs/testing';
import { UnidadMedidasService } from './unidad-medidas.service';

describe('UnidadMedidasService', () => {
  let service: UnidadMedidasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnidadMedidasService],
    }).compile();

    service = module.get<UnidadMedidasService>(UnidadMedidasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
