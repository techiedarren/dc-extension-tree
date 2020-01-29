import { WithStyles, withStyles } from "@material-ui/core";
import React, { PropsWithChildren } from "react";

import {
  ConnectDragSource,
  DragSource,
  DragSourceConnector,
  DragSourceMonitor,
  DragSourceSpec
} from "react-dnd";
import InsertTarget from "./InsertTarget";

import { TreeItem, TreeItemProps } from "../TreeItem";

export const styles = {
  root: {}
};

export type Props = Omit<TreeItemProps, "classes"> &
  PropsWithChildren<WithStyles<typeof styles>> & {
    canInsertNodeIdBefore?: (nodeId: string) => boolean;
    onInsertNodeIdBefore?: (nodeId: string) => void;
  };

export interface DragProps {
  readonly connectDragSource: ConnectDragSource;
  readonly isDragging: boolean;
}

const spec: DragSourceSpec<Props, any> = {
  beginDrag(props: Props, monitor: DragSourceMonitor, component: any): any {
    return {
      nodeId: props.nodeId
    };
  },
  endDrag(props: Props, monitor: DragSourceMonitor, component: any): void {
    const didDrop = monitor.didDrop();
  },
  canDrag(props: Props, monitor: DragSourceMonitor): boolean {
    return true;
  }
};

const collectNodeDragProps: (
  connect: DragSourceConnector,
  monitor: DragSourceMonitor
) => DragProps = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

const DraggableTreeItem: React.SFC<Props & DragProps> = (
  props: Props & DragProps
) => {
  const {
    classes,
    children,
    canInsertNodeIdBefore,
    onInsertNodeIdBefore,
    ...other
  } = props;

  return props.connectDragSource(
    <div>
      <InsertTarget
        canDropNodeId={canInsertNodeIdBefore}
        dropNodeId={onInsertNodeIdBefore}
      />
      <TreeItem {...other}>{children}</TreeItem>
    </div>
  );
};

export default DragSource(
  "tree-item",
  spec,
  collectNodeDragProps
)(withStyles(styles, { name: "DcDraggableTreeItem" })(DraggableTreeItem));
