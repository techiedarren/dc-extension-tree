import { storiesOf } from "@storybook/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { withTheme } from "unofficial-dynamic-content-ui";

import HTML5Backend from "react-dnd-html5-backend";
import { DraggableTreeContext } from "../DraggableTreeContext";
import TreeView from "../TreeView/TreeView";
import DraggableTreeItem from "./DraggableTreeItem";

storiesOf("DraggableTreeItem", module).add("Default Component", () =>
  withTheme(
    <DndProvider backend={HTML5Backend}>
      <DraggableTreeContext.Provider
        value={{
          canInsertBefore: (
            parentNodeId: string,
            childNodeId: string
          ): boolean => {
            return true;
          }
        }}
      >
        <TreeView>
          <DraggableTreeItem nodeId="1" label="Applications">
            <DraggableTreeItem nodeId="2" label="Calendar" />
            <DraggableTreeItem nodeId="3" label="Chrome" />
            <DraggableTreeItem nodeId="4" label="Webstorm" />
          </DraggableTreeItem>
          <DraggableTreeItem nodeId="5" label="Documents">
            <DraggableTreeItem nodeId="6" label="Material-UI">
              <DraggableTreeItem nodeId="7" label="src">
                <DraggableTreeItem nodeId="8" label="index.js" />
                <DraggableTreeItem nodeId="9" label="tree-view.js" />
              </DraggableTreeItem>
            </DraggableTreeItem>
          </DraggableTreeItem>
        </TreeView>
      </DraggableTreeContext.Provider>
    </DndProvider>
  )
);
