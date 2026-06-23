import { ReactNode } from "react";

export default function FunnelGate({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
