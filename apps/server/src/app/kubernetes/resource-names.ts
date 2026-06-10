export const KUBERNETES_PROJECT_NAME_PREFIX = 'kd-project-';
export const KUBERNETES_SERVICE_NAME_PREFIX = 'kd-service-';
export const KUBERNETES_VOLUME_NAME_PREFIX = 'kd-volume-';

export function toKubernetesProjectName(id: string): string {
  return `${KUBERNETES_PROJECT_NAME_PREFIX}${id}`;
}

export function toKubernetesServiceName(id: string): string {
  return `${KUBERNETES_SERVICE_NAME_PREFIX}${id}`;
}

export function toKubernetesVolumeName(id: string): string {
  return `${KUBERNETES_VOLUME_NAME_PREFIX}${id}`;
}

export function toGraphqlProjectId(name: string): string {
  return stripKubernetesPrefix(name, KUBERNETES_PROJECT_NAME_PREFIX);
}

export function toGraphqlServiceId(name: string): string {
  return stripKubernetesPrefix(name, KUBERNETES_SERVICE_NAME_PREFIX);
}

export function toGraphqlVolumeId(name: string): string {
  return stripKubernetesPrefix(name, KUBERNETES_VOLUME_NAME_PREFIX);
}

export function hasKubernetesProjectNamePrefix(name: string): boolean {
  return name.startsWith(KUBERNETES_PROJECT_NAME_PREFIX);
}

export function hasKubernetesServiceNamePrefix(name: string): boolean {
  return name.startsWith(KUBERNETES_SERVICE_NAME_PREFIX);
}

export function hasKubernetesVolumeNamePrefix(name: string): boolean {
  return name.startsWith(KUBERNETES_VOLUME_NAME_PREFIX);
}

function stripKubernetesPrefix(name: string, prefix: string): string {
  if (!name.startsWith(prefix)) {
    throw new Error(
      `Expected Kubernetes resource name to start with ${prefix}`,
    );
  }

  return name.slice(prefix.length);
}
