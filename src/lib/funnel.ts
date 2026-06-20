import { track } from "@/lib/track";
import { setFunnelState } from "@/lib/funnelState";

export function funnel(event: string, props: any = {}) {
  try {
    setFunnelState(event as any, props);

    track(event, {
      ...props,
      funnel_version: "v1",
    });
  } catch {}
}
