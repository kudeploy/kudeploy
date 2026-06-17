import type { DataFilterItemProps } from "./data-filter-item-props";

export interface DataFilterTagItemProps {
  item: DataFilterItemProps;
  value: unknown;
  onChange: (field: string, value: unknown) => void;
  onEmptyClose: (field: string) => void;
  onRemove: (field: string) => void;
}
