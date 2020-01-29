import { WithStyles, withStyles } from "@material-ui/core";
import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import TreeViewContext from "./TreeViewContext";

export const styles = {
  root: {
    padding: 0,
    margin: 0,
    listStyle: "none"
  }
};

export interface Props extends PropsWithChildren<WithStyles<typeof styles>> {
  defaultExpandedNodes?: string[];
  onSelectNode?: (nodeId: string) => void;
}

export const TreeView: React.SFC<Props> = (props: Props) => {
  const {
    children,
    classes,
    onSelectNode,
    defaultExpandedNodes,
    ...other
  } = props;

  const [selected, setSelected] = React.useState<string | undefined>(undefined);

  const [expandedState, setExpandedState] = React.useState(
    defaultExpandedNodes || ([] as string[])
  );
  const expanded = expandedState || [];

  const isExpanded = React.useCallback(id => expanded.indexOf(id) !== -1, [
    expanded
  ]);
  const isSelected = (id: string) => selected === id;

  const toggle = (event: any, nodeId: string) => {
    const newExpanded: string[] =
      expanded.indexOf(nodeId) !== -1
        ? expanded.filter(id => id !== nodeId)
        : [nodeId, ...expanded];
    setExpandedState(newExpanded);
  };

  const select = (nodeId: string) => {
    setSelected(nodeId);

    if (onSelectNode) {
      onSelectNode(nodeId);
    }
  };

  return (
    <TreeViewContext.Provider
      value={{
        isExpanded,
        isSelected,
        toggle,
        select
      }}
    >
      <ul role="tree" className={clsx(classes.root)} {...other}>
        {children}
      </ul>
    </TreeViewContext.Provider>
  );
};

export default withStyles(styles, { name: "DcTreeView" })(TreeView);
