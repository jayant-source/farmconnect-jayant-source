import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
];

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const { user, updateUser } = useAuth();

  const updateLanguageMutation = useMutation({
    mutationFn: async (language: string) => {
      if (user) {
        const response = await apiRequest("PUT", "/api/user/profile", { language });
        return response.json();
      }
      return { user: { language } };
    },
    onSuccess: (data) => {
      if (user) {
        updateUser({ language: data.user.language });
      }
    },
  });

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    updateLanguageMutation.mutate(languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild data-testid="language-toggle">
        <Button variant="outline" size="sm" className="glass-morphism border-white/30 text-white hover:bg-white/30">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline" data-testid="current-language">
              {currentLanguage.code.toUpperCase()}
            </span>
            <span className="text-lg" data-testid="current-flag">
              {currentLanguage.flag}
            </span>
          </motion.div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" data-testid="language-menu">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center space-x-3 cursor-pointer ${
              language.code === i18n.language ? "bg-accent" : ""
            }`}
            data-testid={`language-option-${language.code}`}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
            {language.code === i18n.language && (
              <motion.div
                className="ml-auto w-2 h-2 bg-primary rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
