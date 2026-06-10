import { validate } from 'class-validator';

import { CreateServiceInput } from './create-service.input';
import { UpdateServiceInput } from './update-service.input';

describe('Service replicas input validation', () => {
  it('accepts the maximum Service replica count when creating a Service', async () => {
    const input = new CreateServiceInput();
    input.projectId = 'project-1';
    input.name = 'api';
    input.image = 'nginx:latest';
    input.ports = [];
    input.replicas = 100;

    await expect(validate(input)).resolves.toHaveLength(0);
  });

  it('rejects Service replica counts above the maximum when creating a Service', async () => {
    const input = new CreateServiceInput();
    input.projectId = 'project-1';
    input.name = 'api';
    input.image = 'nginx:latest';
    input.ports = [];
    input.replicas = 101;

    const errors = await validate(input);

    expect(errors).toEqual([
      expect.objectContaining({
        constraints: expect.objectContaining({
          max: expect.any(String),
        }),
        property: 'replicas',
      }),
    ]);
  });

  it('accepts the maximum Service replica count when updating a Service', async () => {
    const input = new UpdateServiceInput();
    input.replicas = 100;

    await expect(validate(input)).resolves.toHaveLength(0);
  });

  it('rejects Service replica counts above the maximum when updating a Service', async () => {
    const input = new UpdateServiceInput();
    input.replicas = 101;

    const errors = await validate(input);

    expect(errors).toEqual([
      expect.objectContaining({
        constraints: expect.objectContaining({
          max: expect.any(String),
        }),
        property: 'replicas',
      }),
    ]);
  });
});
