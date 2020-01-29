import React from "react";

import { init, SDK } from "dc-extensions-sdk";
import {
  Editor,
  EditorRegistry,
  getDefaultRegistry,
  getExtensionParams,
  SdkContext,
  withTheme
} from "unofficial-dynamic-content-ui";
import EditorTreeField from "./EditorTreeField/EditorTreeField";

interface AppState {
  connected: boolean;
  sdk?: SDK;
  value?: string;
  schema?: any;
  openDialog?: string;
  openDialogCallback?: (value: any) => void;
}

const registry: EditorRegistry = getDefaultRegistry();
registry.fieldProviders.splice(0, 0, (schema: any) =>
  schema && schema["ui:widget"] === "tree" ? EditorTreeField : undefined
);

export default class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = { connected: false };
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  public componentDidMount(): void {
    this.handleConnect();
  }

  public async handleConnect(): Promise<void> {
    const sdk: SDK = await init();
    sdk.frame.startAutoResizer();

    const value: string = await sdk.field.getValue();
    this.setState({
      sdk,
      connected: true,
      value,
      schema: {
        ...sdk.field.schema,
        "ui:widget": "tree"
      }
    });
  }

  public async handleValueChange(value: string): Promise<void> {
    if (this.state.connected && this.state.sdk) {
      try {
        await this.state.sdk.field.setValue(value);
        // tslint:disable-next-line
      } catch (err) {}
    }
  }

  public render(): React.ReactElement {
    return (
      <div className="App">
        {this.state.connected === true ? (
          <div>
            {this.state.sdk ? (
              <SdkContext.Provider value={{ sdk: this.state.sdk }}>
                {withTheme(
                  <Editor
                    pointer={
                      getExtensionParams(this.state.sdk.field.schema, {})
                        .pointer
                    }
                    onChange={this.handleValueChange}
                    schema={this.state.schema}
                    value={this.state.value}
                    registry={registry}
                  />
                )}
              </SdkContext.Provider>
            ) : null}
          </div>
        ) : (
          <div>&nbsp;</div>
        )}
      </div>
    );
  }
}
