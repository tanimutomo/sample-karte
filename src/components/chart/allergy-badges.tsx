import type { Allergy } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";

const severityVariant: Record<string, "default" | "secondary" | "destructive"> = {
  mild: "secondary",
  moderate: "default",
  severe: "destructive",
};

const severityLabel: Record<string, string> = {
  mild: "軽度",
  moderate: "中等度",
  severe: "重度",
};

interface AllergyBadgesProps {
  allergies: Allergy[];
}

export function AllergyBadges({ allergies }: AllergyBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {allergies.map((allergy) => (
        <Badge
          key={allergy.id}
          variant={severityVariant[allergy.severity] ?? "default"}
          title={`${allergy.allergen} (${severityLabel[allergy.severity]})${allergy.reaction ? ` - ${allergy.reaction}` : ""}`}
        >
          {allergy.allergen}
          <span className="ml-1 opacity-70">
            [{severityLabel[allergy.severity]}]
          </span>
        </Badge>
      ))}
    </div>
  );
}
