import type { DataFilterOperator } from "../types";

export interface DataFilterRenderContext<
  TValue = unknown,
  TOperator extends DataFilterOperator = DataFilterOperator,
> {
  operator: TOperator;
  field: {
    value: TValue | undefined;
    onChange: (value: TValue | undefined) => void;
  };
}
