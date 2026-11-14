export interface WalkthroughScreenManifestItem {
  id: string;
  screenId?: string;
  title: string;
  description?: string;
  imagePath: string;
  width: number;
  height: number;
  duration: number;
  transitionType?: string;
}

declare const manifest: {
  projectName?: string;
  projectId?: string;
  videoConfig: {
    fps: number;
    width: number;
    height: number;
    durationInSeconds?: number;
  };
  screens: WalkthroughScreenManifestItem[];
};

export default manifest;
