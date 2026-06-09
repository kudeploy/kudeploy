import { validate } from 'class-validator';

import { ServicePortInput } from './service-port.input';

describe('ServicePortInput', () => {
  it('accepts the maximum Kubernetes service port number', async () => {
    const input = new ServicePortInput();
    input.port = 65535;
    input.targetPort = 65535;

    await expect(validate(input)).resolves.toHaveLength(0);
  });

  it('rejects service ports above the Kubernetes valid range', async () => {
    const input = new ServicePortInput();
    input.port = 65536;

    const errors = await validate(input);

    expect(errors).toEqual([
      expect.objectContaining({
        constraints: expect.objectContaining({
          max: expect.any(String),
        }),
        property: 'port',
      }),
    ]);
  });

  it('rejects target ports above the Kubernetes valid range', async () => {
    const input = new ServicePortInput();
    input.port = 80;
    input.targetPort = 65536;

    const errors = await validate(input);

    expect(errors).toEqual([
      expect.objectContaining({
        constraints: expect.objectContaining({
          max: expect.any(String),
        }),
        property: 'targetPort',
      }),
    ]);
  });
});
