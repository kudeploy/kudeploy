import { validate } from 'class-validator';

import { ServiceVolumeInput } from './service-volume.input';

describe('ServiceVolumeInput', () => {
  it('accepts a complete service volume mount', async () => {
    const input = new ServiceVolumeInput();
    input.volumeId = 'data';
    input.mountPath = '/data';
    input.subPath = 'uploads';
    input.readOnly = true;

    await expect(validate(input)).resolves.toHaveLength(0);
  });

  it('requires a volume id and mount path', async () => {
    const input = new ServiceVolumeInput();

    const errors = await validate(input);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraints: expect.objectContaining({
            isString: expect.any(String),
          }),
          property: 'volumeId',
        }),
        expect.objectContaining({
          constraints: expect.objectContaining({
            isString: expect.any(String),
          }),
          property: 'mountPath',
        }),
      ]),
    );
  });
});
