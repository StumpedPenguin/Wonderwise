import { requireFamily } from "@/lib/family";
import { getFamily } from "@/lib/db";
import { isUnlocked } from "@/lib/parent-pin";
import { ParentPinGate } from "@/components/ParentPinGate";

export const dynamic = "force-dynamic";

// Gates every /parent route behind the optional grown-up PIN.
export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const familyId = await requireFamily();
  const family = await getFamily(familyId);
  const pin = family?.parentPin ?? null;
  if (pin && !(await isUnlocked(familyId, pin))) {
    return <ParentPinGate />;
  }
  return <>{children}</>;
}
