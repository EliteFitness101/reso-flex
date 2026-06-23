export interface FunnelState {
  step: number;
  source?: string;
}

export const initialFunnelState: FunnelState = {
  step: 1,
};
