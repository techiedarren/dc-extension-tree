import React from "react";

export interface TreeViewContextInterface {
  isExpanded: (nodeId: string) => boolean;
  isSelected: (nodeId: string) => boolean;
  toggle: (event: any, value: string) => void;
  select: (nodeId: string) => void;
}

const TreeViewContext = React.createContext<TreeViewContextInterface>({
  isExpanded: () => false,
  isSelected: () => false,
  // tslint:disable-next-line:no-empty
  toggle: () => {},
  // tslint:disable-next-line:no-empty
  select: () => {}
});

export default TreeViewContext;
