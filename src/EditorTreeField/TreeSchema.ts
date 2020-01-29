export class TreeSchema {
  public nodeTypes: { [type: string]: TreeSchemaNodeType } = {};
  public rootNodeTypes: string[];

  constructor(private schema: any) {
    if (schema.type !== "array") {
      throw new Error('the field must have a type of "array"');
    }
    this.rootNodeTypes = this.findNodeTypes(schema.items.oneOf || []).map(
      x => x.name
    );
  }

  private findNodeTypes(nodeSchemas: any): TreeSchemaNodeType[] {
    const result: TreeSchemaNodeType[] = [];

    for (const schema of nodeSchemas) {
      if (schema.type !== "object") {
        throw new Error('nodes must have a type of "object"');
      }

      if (
        !schema.properties ||
        !schema.properties.type ||
        !schema.properties.type.const
      ) {
        throw new Error('nodes must define a constant "type" property');
      }

      const nodeTypeName = schema.properties.type.const;

      if (this.nodeTypes[nodeTypeName]) {
        // Already defined
        result.push(this.nodeTypes[nodeTypeName]);
      } else {
        // Not yet defined
        const dataSchema = schema.properties.data || {};
        if (!dataSchema.title && schema.title) {
          dataSchema.title = schema.title;
        }

        let childNodeTypes: string[] = [];

        if (
          schema.properties.children &&
          schema.properties.children.items &&
          schema.properties.children.items.oneOf
        ) {
          childNodeTypes = this.findNodeTypes(
            schema.properties.children.items.oneOf
          ).map(x => x.name);
        }

        const nodeSchema: TreeSchemaNodeType = {
          name: nodeTypeName,
          label: schema.title || nodeTypeName,
          dataSchema,
          childNodeTypes,
          rawSchema: schema
        };

        if (schema.labelField) {
          nodeSchema.labelField = schema.labelField;
        }

        this.nodeTypes[nodeTypeName] = nodeSchema;
        result.push(nodeSchema);
      }
    }

    return result;
  }
}

export interface TreeSchemaNodeType {
  name: string;
  label: string;
  childNodeTypes: string[];
  dataSchema: any;
  rawSchema: any;
  labelField?: string;
}
