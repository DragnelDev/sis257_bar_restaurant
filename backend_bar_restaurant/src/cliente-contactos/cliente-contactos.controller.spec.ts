import { Test, TestingModule } from '@nestjs/testing';
import { ClienteContactosController } from './cliente-contactos.controller';
import { ClienteContactosService } from './cliente-contactos.service';

describe('ClienteContactosController', () => {
  let controller: ClienteContactosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClienteContactosController],
      providers: [ClienteContactosService],
    }).compile();

    controller = module.get<ClienteContactosController>(
      ClienteContactosController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
