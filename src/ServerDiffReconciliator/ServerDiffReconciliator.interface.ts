interface IVNodeProps {
  className?: string;
  selected?: boolean;
  correct?: boolean | null;
  disabled?: boolean;
  content?: string;
  [key: string]: unknown;
}

export interface IVNode {
  type: string;
  props: IVNodeProps;
  key?: string | number;
  children?: IVNode[];
}
