import { Test, TestingModule } from '@nestjs/testing';
import { DetalleRecetasController } from './detalle-recetas.controller';
import { DetalleRecetaService } from './detalle-recetas.service';

describe('DetalleRecetasController', () => {
  let controller: DetalleRecetasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleRecetasController],
      providers: [DetalleRecetaService],
    }).compile();

    controller = module.get<DetalleRecetasController>(DetalleRecetasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
