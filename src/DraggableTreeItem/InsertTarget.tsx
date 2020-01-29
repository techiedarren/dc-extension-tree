import { Theme, WithStyles, withStyles } from "@material-ui/core";
import React, { PropsWithChildren } from "react";

import clsx from "clsx";
import {
  ConnectDropTarget,
  DropTarget,
  DropTargetConnector,
  DropTargetMonitor,
  DropTargetSpec
} from "react-dnd";

export const styles = (theme: Theme) => ({
  root: {
    height: 3,
    width: "100%"
  },

  dropping: {
    background: theme.palette.primary.main
  }
});

export type Props = WithStyles<typeof styles> & {
  canDropNodeId?: (nodeId: string) => boolean;
  dropNodeId?: (nodeId: string) => void;
};

export interface DropProps {
  readonly connectDropTarget: ConnectDropTarget;
  readonly canDrop: boolean;
  readonly isDropping: boolean;
}

const spec: DropTargetSpec<Props> = {
  canDrop(props: Props, monitor: DropTargetMonitor): boolean {
    if (props.canDropNodeId) {
      return props.canDropNodeId(monitor.getItem().nodeId);
    } else {
      return false;
    }
  },
  drop(props: Props, monitor: DropTargetMonitor): void {
    if (props.dropNodeId) {
      props.dropNodeId(monitor.getItem().nodeId);
    }
  }
};

const collectNodeDropProps = (
  connect: DropTargetConnector,
  monitor: DropTargetMonitor
): DropProps => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop(),
  isDropping: monitor.isOver({ shallow: true }) && monitor.canDrop()
});

export const InsertTarget: React.SFC<Props & DropProps> = (
  props: Props & DropProps
) => {
  const { classes, ...other } = props;

  return props.connectDropTarget(
    <div
      className={clsx(classes.root, {
        [classes.dropping]: props.isDropping
      })}
    />
  );
};

export default DropTarget(
  "tree-item",
  spec,
  collectNodeDropProps
)(
  withStyles(styles as any, { name: "DcDraggableTreeItemInsertTarget" })(
    InsertTarget
  )
);
