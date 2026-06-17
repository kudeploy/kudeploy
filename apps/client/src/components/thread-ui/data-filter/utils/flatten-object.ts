import { forEach, isPlainObject, transform } from "lodash";

import type { DataFilterValues } from "../types";

export const flattenObject = (obj: DataFilterValues): DataFilterValues => {
  return transform<DataFilterValues, DataFilterValues>(
    obj,
    (result, value, key) => {
      if (isPlainObject(value)) {
        const nested = flattenObject(value);
        forEach(nested, (nestedValue, nestedKey) => {
          result[`${key}.${nestedKey}`] = nestedValue;
        });
      } else {
        result[key] = value;
      }
    },
    {},
  );
};
