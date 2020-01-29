import React from "react";

import {
  Button,
  ButtonGroup,
  Theme,
  Toolbar,
  Typography,
  withStyles,
  WithStyles
} from "@material-ui/core";
import clsx from "clsx";
import {
  EditorField,
  WithEditorFieldProps
} from "unofficial-dynamic-content-ui";
import { TreeSchema } from "./TreeSchema";

import TreeView from "../TreeView";
import { ImmutableTreeModel, TreeNode } from "./ImmutableTreeModel";

import { AccountTree } from "@material-ui/icons";

import { DraggableTreeItem } from "../DraggableTreeItem";
import InsertNodeButton from "../InsertNodeButton/InsertNodeButton";
import { TreeItem } from "../TreeItem";

import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

export const styles = (theme: Theme) => ({
  root: {
    display: "flex",
    border: "1px solid rgba(157,162,162,.3)",
    "border-radius": 5
  },
  treePane: {
    flex: 0.4,
    "border-right": "1px solid #e5e5e5"
  },
  tree: {
    padding: "10px 10px 10px 10px"
  },
  toolbar: {
    "background-color": "#f5f5f5",
    "border-bottom": "1px solid #e5e5e5",
    "border-radius": 5,
    color: theme.palette.primary.main,
    "padding-left": 10,
    "padding-right": 10
  },
  dataPane: {
    flex: 0.7,
    padding: "10px 10px 10px 10px"
  },
  grow: {
    flexGrow: 1
  }
});

export interface Props
  extends WithEditorFieldProps<WithStyles<typeof styles>> {}

const EditorTreeField: React.SFC<Props> = (props: Props) => {
  const { schema, value, onChange, classes, pointer } = props;

  const treeSchema: TreeSchema = new TreeSchema(schema);
  const treeModel: ImmutableTreeModel = new ImmutableTreeModel(
    value,
    pointer,
    treeSchema
  );
  const [selectedNodeId, setSelectedNodeId] = React.useState<
    string | undefined
  >();

  const renderTreeChildren = (children: TreeNode[]) => {
    return children.map(child => (
      <DraggableTreeItem
        key={child.nodeId}
        nodeId={child.nodeId}
        label={child.label}
        canInsertNodeIdBefore={nodeId =>
          handleCanInsertNodeIdBefore(nodeId, child.nodeId)
        }
        onInsertNodeIdBefore={nodeId =>
          handleOnInsertNodeIdBefore(nodeId, child.nodeId)
        }
      >
        {renderTreeChildren(child.children)}
      </DraggableTreeItem>
    ));
  };

  const handleNodeSelected = React.useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const selectedNode: TreeNode | undefined = selectedNodeId
    ? treeModel.allNodes[selectedNodeId]
    : undefined;
  const insertNodeTypes = selectedNode
    ? treeSchema.nodeTypes[selectedNode.nodeType].childNodeTypes
    : treeSchema.rootNodeTypes;

  const handleDataChange = React.useCallback(
    (nodeDataValue: any) => {
      if (!selectedNodeId) {
        return;
      }

      const newModel = treeModel.setNodeData(selectedNodeId, nodeDataValue);
      if (onChange) {
        onChange(newModel.value);
      }
    },
    [selectedNodeId, treeModel]
  );

  const handleInsertNode = React.useCallback(
    (nodeType: any) => {
      const newModel = treeModel.insertNode(selectedNodeId, nodeType);
      if (onChange) {
        onChange(newModel.value);
      }
    },
    [selectedNodeId, treeModel]
  );

  const handleDeleteNode = React.useCallback(() => {
    const newModel = treeModel.deleteNode(selectedNodeId);
    if (onChange) {
      onChange(newModel.value);
    }
  }, [selectedNodeId, setSelectedNodeId, treeModel]);

  const handleCanInsertNodeIdBefore = React.useCallback(
    (sourceId: string, targetId: string) => {
      const targetNode = treeModel.allNodes[targetId];
      return treeModel.canInsertNode(targetNode.parentId, sourceId);
    },
    [treeModel]
  );

  const handleOnInsertNodeIdBefore = React.useCallback(
    (sourceId: string, targetId: string) => {
      const newModel = treeModel.insertNodeBefore(sourceId, targetId);
      if (onChange) {
        onChange(newModel.value);
      }
    },
    [treeModel]
  );

  const defaultExpandedNodes = [undefined as any];

  return (
    <div className={clsx(classes.root)}>
      <div className={clsx(classes.treePane)}>
        <Toolbar
          className={clsx(classes.toolbar)}
          variant="dense"
          disableGutters={true}
        >
          <AccountTree />

          <div className={classes.grow} />

          <ButtonGroup variant="outlined">
            <InsertNodeButton
              onClick={handleInsertNode}
              treeSchema={treeSchema}
              nodeTypes={insertNodeTypes}
            />
            <Button
              onClick={handleDeleteNode}
              variant="outlined"
              color="primary"
              disabled={!Boolean(selectedNode)}
            >
              <Typography>Delete</Typography>
            </Button>
          </ButtonGroup>
        </Toolbar>
        <div className={clsx(classes.tree)}>
          <DndProvider backend={HTML5Backend}>
            <TreeView
              defaultExpandedNodes={defaultExpandedNodes}
              onSelectNode={handleNodeSelected}
            >
              <TreeItem label={schema.title || "Root"} nodeId="">
                {renderTreeChildren(treeModel.children)}
              </TreeItem>
            </TreeView>
          </DndProvider>
        </div>
      </div>
      <div className={clsx(classes.dataPane)}>
        {selectedNode ? (
          <EditorField
            {...props}
            onChange={handleDataChange}
            schema={treeSchema.nodeTypes[selectedNode.nodeType].dataSchema}
            value={treeModel.rawValues[selectedNode.nodeId].data}
            pointer={selectedNode.dataPointer}
          />
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default withStyles(styles as any, { name: "DcEditorTreeField" })(
  EditorTreeField
);
