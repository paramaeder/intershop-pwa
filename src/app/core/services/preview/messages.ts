export interface DesignViewMessage {
  type: string;
  payload?: any;
}

export interface SetPreviewContextMessage extends DesignViewMessage {
  payload?: {
    previewContextID: string;
  };
}
