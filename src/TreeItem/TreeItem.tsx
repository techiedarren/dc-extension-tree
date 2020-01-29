import { Theme, WithStyles, withStyles } from "@material-ui/core";
import clsx from "clsx";
import React, { PropsWithChildren } from "react";

// tslint:disable-next-line:no-submodule-imports
import Collapse from "@material-ui/core/Collapse";
// tslint:disable-next-line:no-submodule-imports
import Typography from "@material-ui/core/Typography";
import { KeyboardArrowDown, KeyboardArrowRight } from "@material-ui/icons";
import TreeViewContext from "../TreeView/TreeViewContext";

const styles = (theme: Theme) => ({
  root: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    outline: 0,
    WebkitTapHighlightColor: "transparent",
    color: theme.palette.text.secondary
  },
  selected: {
    // color: theme.palette.primary.main
  },
  /* Pseudo-class applied to the root element when expanded. */
  expanded: {},
  /* Styles applied to the `role="group"` element. */
  group: {
    margin: 0,
    padding: 0,
    marginLeft: 26
  },
  /* Styles applied to the tree node content. */
  content: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      color: theme.palette.text.primary
    }
  },
  /* Styles applied to the tree node icon and collapse/expand icon. */
  iconContainer: {
    marginRight: 2,
    width: 15,
    display: "flex",
    justifyContent: "center"
  },
  indent: {
    width: 18
  },
  /* Styles applied to the label element. */
  label: {
    width: "100%"
  }
});

export interface TreeItemProps
  extends PropsWithChildren<WithStyles<typeof styles>> {
  nodeId?: string;
  label: string;
}

const TreeItem: React.SFC<TreeItemProps> = (props: TreeItemProps) => {
  const { children, classes, nodeId = "", label, ...other } = props;

  const { isExpanded, isSelected, toggle, select } = React.useContext(
    TreeViewContext
  );

  const nodeRef = React.useRef(null);
  const contentRef = React.useRef(null);

  const expandable = Boolean(
    Array.isArray(children) ? children.length : children
  );
  const expanded = isExpanded ? isExpanded(nodeId) : false;
  const selected = isSelected ? isSelected(nodeId) : false;

  const handleClick = (event: any) => {
    if (!selected) {
      select(nodeId);
    }

    if (expandable && !expanded && toggle) {
      toggle(event, nodeId);
    }
  };

  const handleClickIcon = (event: any) => {
    if (expandable && toggle) {
      toggle(event, nodeId);
    }
  };

  const expandIcon = expandable ? (
    expanded ? (
      <KeyboardArrowDown style={{ width: 15, height: 15 }} />
    ) : (
      <KeyboardArrowRight style={{ width: 15, height: 15 }} />
    )
  ) : null;

  return (
    <li
      className={clsx(classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected
      })}
      role="treeitem"
      aria-expanded={expandable ? expanded : undefined}
      {...other}
    >
      <div className={classes.content} ref={contentRef} onClick={handleClick}>
        {expandIcon ? (
          <div onClick={handleClickIcon} className={classes.iconContainer}>
            {expandIcon}
          </div>
        ) : (
          <div className={clsx(classes.indent)} />
        )}
        <Typography component={"div" as any} className={classes.label}>
          {label}
        </Typography>
      </div>
      {children && (
        <Collapse
          unmountOnExit={true}
          className={classes.group}
          in={expanded}
          component="ul"
        >
          {children}
        </Collapse>
      )}
    </li>
  );
};

export default withStyles(styles, { name: "DcTreeItem" })(TreeItem);
