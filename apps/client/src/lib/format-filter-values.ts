const DATA_FILTER_OPERATORS = new Set([
  "$eq",
  "$ne",
  "$gt",
  "$gte",
  "$lt",
  "$lte",
  "$fulltext",
  "$in",
  "$nin",
]);

function unwrapFilterValue(value: any): any {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const condition = Object.entries(value).find(([operator]) =>
    DATA_FILTER_OPERATORS.has(operator),
  );

  return condition ? condition[1] : value;
}

export function formatFilterValues(
  values: Record<string, any>,
  formatValue?: (field: string, value: any) => any,
): Record<string, any> {
  const filter: Record<string, any> = {};

  for (const [key, value] of Object.entries(values)) {
    const unwrappedValue = unwrapFilterValue(value);
    filter[key] = formatValue?.(key, unwrappedValue) ?? unwrappedValue;
  }

  return filter;
}
