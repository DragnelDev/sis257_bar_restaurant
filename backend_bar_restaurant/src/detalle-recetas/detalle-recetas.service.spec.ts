import { Test, TestingModule } from '@nestjs/testing';
import { DetalleRecetaService } from './detalle-recetas.service';

describe('DetalleRecetaService', () => {
  let service: DetalleRecetaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleRecetaService],
    }).compile();

    service = module.get<DetalleRecetaService>(DetalleRecetaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
