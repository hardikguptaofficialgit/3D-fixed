import { LegacyPageFrame } from "@/components/legacy-page-frame";
import { LEGACY_ROUTE_MAP } from "@/lib/legacy-routes";

export default function Page() {
  return <LegacyPageFrame title="Luxury Service" src={LEGACY_ROUTE_MAP.luxuryService} />;
}
