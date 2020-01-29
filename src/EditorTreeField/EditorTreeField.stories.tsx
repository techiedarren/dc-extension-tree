import { storiesOf } from "@storybook/react";
import React from "react";
import {
  EditorRegistry,
  forExtensionName,
  getDefaultRegistry,
  withEditor
} from "unofficial-dynamic-content-ui";
import EditorTreeField from "./EditorTreeField";

const menuItemNode = {
  type: "object",
  title: "Menu Item",

  labelField: "label",

  properties: {
    type: {
      const: "menu-item"
    },
    data: {
      type: "object",
      properties: {
        label: {
          type: "string",
          title: "Label",
          description: "Menu item label"
        },
        url: {
          type: "string",
          title: "URL",
          description: "Menu item URL"
        }
      }
    }
  }
};

const menuNode = {
  type: "object",
  title: "Menu",

  labelField: "label",

  properties: {
    type: {
      const: "menu"
    },
    data: {
      type: "object",
      properties: {
        label: {
          type: "string",
          title: "Label",
          description: "Menu label"
        }
      }
    },
    children: {
      type: "array",
      items: {
        oneOf: [menuItemNode]
      }
    }
  }
};

const schema = {
  type: "object",

  properties: {
    menu: {
      type: "array",
      title: "Mega Menu",

      "ui:widget": "tree",

      items: {
        oneOf: [menuNode]
      }
    }
  },

  definitions: {}
};

const value = [
  {
    type: "menu",
    data: {
      label: "Kitchen Appliances"
    },
    children: [
      {
        type: "menu-item",
        data: {
          label: "Laundry"
        }
      },
      {
        type: "menu-item",
        data: {
          label: "Dishwashers"
        }
      },
      {
        type: "menu-item",
        data: {
          label: "Cooking"
        }
      }
    ]
  }
];

const registry: EditorRegistry = getDefaultRegistry();
registry.fieldProviders.splice(0, 0, (fieldSchema: any) =>
  fieldSchema && fieldSchema["ui:widget"] === "tree"
    ? EditorTreeField
    : undefined
);

storiesOf("EditorTreeField", module).add("Editor", () =>
  withEditor(schema.properties.menu, value, registry)
);
