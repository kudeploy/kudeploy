import { omitBy } from "lodash";

import { isEmpty } from "./is-empty";
import type { DataFilterValues } from "../types";

export const omitEmpty = (obj: DataFilterValues): DataFilterValues =>
  omitBy(obj, isEmpty);
