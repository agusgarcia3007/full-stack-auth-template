import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = (checked: boolean) => {
    const newLang = checked ? "en" : "es";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor="language-switch" className="cursor-pointer text-sm">
        {t("userMenu.language")}
      </Label>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">ES</span>
        <Switch
          id="language-switch"
          checked={i18n.language === "en"}
          onCheckedChange={toggleLanguage}
        />
        <span className="text-muted-foreground text-xs">EN</span>
      </div>
    </div>
  );
}
