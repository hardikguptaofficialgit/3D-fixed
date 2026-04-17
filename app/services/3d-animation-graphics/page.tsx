import { LegacyPageFrame } from "@/components/legacy-page-frame";
import { LEGACY_ROUTE_MAP } from "@/lib/legacy-routes";

export default function Page() {
  return <LegacyPageFrame title="3D Animation Graphics" src={LEGACY_ROUTE_MAP.animation3d} />;
}
