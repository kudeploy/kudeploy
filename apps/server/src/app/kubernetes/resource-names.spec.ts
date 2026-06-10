import { toKubernetesWorkspaceName } from './resource-names';

describe('Kubernetes resource names', () => {
  it('prefixes workspace ids for Kubernetes workspace labels', () => {
    expect(toKubernetesWorkspaceName('123')).toBe('kd-workspace-123');
  });
});
