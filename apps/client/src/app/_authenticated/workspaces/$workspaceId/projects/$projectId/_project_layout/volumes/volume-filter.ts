export function formatVolumeFilterValue(field: string, value: unknown) {
  if (field === "name") {
    return { $eq: value };
  }

  return value;
}
