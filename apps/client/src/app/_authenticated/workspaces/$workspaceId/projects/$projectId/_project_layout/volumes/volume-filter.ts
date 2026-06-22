import { formatConnectionFilterValue } from "@/lib/format-filter-values";

export function formatVolumeFilterValue(
  field: string,
  value: unknown,
  operator?: string,
) {
  if (field === "name") {
    return operator ? { [operator]: value } : { $eq: value };
  }

  return formatConnectionFilterValue(field, value, operator);
}
