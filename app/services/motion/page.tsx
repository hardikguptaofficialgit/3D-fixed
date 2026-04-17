import { LegacyPageFrame } from "@/components/legacy-page-frame";
import { LEGACY_ROUTE_MAP } from "@/lib/legacy-routes";

export default function Page() {
  return <LegacyPageFrame title="Motion" src={LEGACY_ROUTE_MAP.motion} />;
}
