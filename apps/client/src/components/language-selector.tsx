import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function LanguageSelector() {
  const { i18n, t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="cursor-pointer text-sm">
        {t("userMenu.language")}
      </Label>
      <ToggleGroup
        type="single"
        value={i18n.language}
        onValueChange={(value) => value && i18n.changeLanguage(value)}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="es">ES</ToggleGroupItem>
        <ToggleGroupItem value="en">EN</ToggleGroupItem>
        <ToggleGroupItem value="pt">PT</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
