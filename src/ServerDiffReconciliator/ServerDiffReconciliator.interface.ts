interface VNodeProps {
  className?: string;
  selected?: boolean;
  correct?: boolean | null;
  disabled?: boolean;
  content?: string;
  [key: string]: unknown;
}

export interface VNode {
  type: string;
  props: VNodeProps;
  key?: string | number;
  children?: VNode[];
}
