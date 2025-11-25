import { Test, TestingModule } from '@nestjs/testing';
import { ClienteContactosService } from './cliente-contactos.service';

describe('ClienteContactosService', () => {
  let service: ClienteContactosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClienteContactosService],
    }).compile();

    service = module.get<ClienteContactosService>(ClienteContactosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
