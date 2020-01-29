import React from "react";

export interface DraggableTreeContextParams {
  canInsertBefore?: (parentNodeId: string, childNodeId: string) => boolean;
}

const context = React.createContext<DraggableTreeContextParams>({});
export default context;
