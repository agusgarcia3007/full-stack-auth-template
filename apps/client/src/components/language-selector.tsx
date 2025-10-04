import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "pt" : "es";
    i18n.changeLanguage(newLang);
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="fixed top-4 right-4"
    >
      {i18n.language === "es" ? "🇧🇷 PT" : "🇪🇸 ES"}
    </Button>
  );
}
