import { Test, TestingModule } from '@nestjs/testing';
import { UnidadMedidasController } from './unidad-medidas.controller';
import { UnidadMedidasService } from './unidad-medidas.service';

describe('UnidadMedidasController', () => {
  let controller: UnidadMedidasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnidadMedidasController],
      providers: [UnidadMedidasService],
    }).compile();

    controller = module.get<UnidadMedidasController>(UnidadMedidasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
