import {
  Button,
  Menu,
  MenuItem,
  Typography,
  WithStyles,
  withStyles
} from "@material-ui/core";

import React from "react";
import { TreeSchema } from "../EditorTreeField/TreeSchema";

export const styles = {
  root: {}
};

export interface Props extends WithStyles<typeof styles> {
  treeSchema: TreeSchema;
  nodeTypes: string[];
  onClick: (nodeType: string) => void;
}

export const InsertNodeButton: React.SFC<Props> = (props: Props) => {
  const { treeSchema, nodeTypes, onClick } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (nodeType: string) => {
    setAnchorEl(null);
    onClick(nodeType);
  };

  return (
    <div>
      <Button
        variant="outlined"
        color="primary"
        disabled={nodeTypes.length === 0}
        onClick={handleClick}
      >
        <Typography>+ Add</Typography>
      </Button>

      <Menu open={Boolean(anchorEl)} onClose={handleClose} anchorEl={anchorEl}>
        {nodeTypes.map(nodeType => (
          <MenuItem key={nodeType} onClick={() => handleSelect(nodeType)}>
            {treeSchema.nodeTypes[nodeType].label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default withStyles(styles, {
  name: "DcEditorTreeFieldInsertNodeButton"
})(InsertNodeButton);
