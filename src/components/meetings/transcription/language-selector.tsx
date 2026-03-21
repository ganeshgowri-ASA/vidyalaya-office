'use client';

import React, { useState, useMemo } from 'react';
import { Globe, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LanguageOption } from '@/types/transcription';

const LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English', supported: true },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English', supported: true },
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English', supported: true },
  { code: 'en-IN', name: 'English (India)', nativeName: 'English', supported: true },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', supported: true },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', supported: true },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', supported: true },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', supported: true },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', supported: true },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', supported: true },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', supported: true },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', supported: true },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', supported: true },
  { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو', supported: true },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', supported: true },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español', supported: true },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', supported: true },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', supported: true },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', supported: true },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português', supported: true },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português', supported: true },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', supported: true },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文（简体）', supported: true },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文（繁體）', supported: true },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', supported: true },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', supported: true },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', nativeName: 'العربية', supported: true },
  { code: 'ar-EG', name: 'Arabic (Egypt)', nativeName: 'العربية', supported: true },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', supported: true },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', supported: true },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', supported: true },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', supported: true },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', supported: true },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk', supported: true },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', supported: true },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', supported: true },
  { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština', supported: true },
  { code: 'ro-RO', name: 'Romanian', nativeName: 'Română', supported: true },
  { code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar', supported: true },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', supported: true },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', supported: true },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', supported: true },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', supported: true },
  { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', supported: true },
  { code: 'fil-PH', name: 'Filipino', nativeName: 'Filipino', supported: true },
  { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית', supported: true },
  { code: 'fa-IR', name: 'Persian', nativeName: 'فارسی', supported: true },
  { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', supported: true },
  { code: 'bg-BG', name: 'Bulgarian', nativeName: 'Български', supported: true },
  { code: 'hr-HR', name: 'Croatian', nativeName: 'Hrvatski', supported: true },
  { code: 'sk-SK', name: 'Slovak', nativeName: 'Slovenčina', supported: true },
  { code: 'sl-SI', name: 'Slovenian', nativeName: 'Slovenščina', supported: true },
  { code: 'sr-RS', name: 'Serbian', nativeName: 'Srpski', supported: true },
  { code: 'lt-LT', name: 'Lithuanian', nativeName: 'Lietuvių', supported: true },
  { code: 'lv-LV', name: 'Latvian', nativeName: 'Latviešu', supported: true },
  { code: 'et-EE', name: 'Estonian', nativeName: 'Eesti', supported: true },
  { code: 'ka-GE', name: 'Georgian', nativeName: 'ქართული', supported: true },
  { code: 'hy-AM', name: 'Armenian', nativeName: 'Հայերեն', supported: true },
  { code: 'az-AZ', name: 'Azerbaijani', nativeName: 'Azərbaycan', supported: true },
  { code: 'kk-KZ', name: 'Kazakh', nativeName: 'Қазақ', supported: true },
  { code: 'uz-UZ', name: 'Uzbek', nativeName: 'O\'zbek', supported: true },
  { code: 'ne-NP', name: 'Nepali', nativeName: 'नेपाली', supported: true },
  { code: 'si-LK', name: 'Sinhala', nativeName: 'සිංහල', supported: true },
  { code: 'my-MM', name: 'Burmese', nativeName: 'မြန်မာ', supported: true },
  { code: 'km-KH', name: 'Khmer', nativeName: 'ខ្មែរ', supported: true },
  { code: 'lo-LA', name: 'Lao', nativeName: 'ລາວ', supported: true },
  { code: 'mn-MN', name: 'Mongolian', nativeName: 'Монгол', supported: true },
  { code: 'am-ET', name: 'Amharic', nativeName: 'አማርኛ', supported: true },
  { code: 'yo-NG', name: 'Yoruba', nativeName: 'Yorùbá', supported: true },
  { code: 'ig-NG', name: 'Igbo', nativeName: 'Igbo', supported: true },
  { code: 'zu-ZA', name: 'Zulu', nativeName: 'isiZulu', supported: true },
  { code: 'af-ZA', name: 'Afrikaans', nativeName: 'Afrikaans', supported: true },
  { code: 'ca-ES', name: 'Catalan', nativeName: 'Català', supported: true },
  { code: 'eu-ES', name: 'Basque', nativeName: 'Euskara', supported: true },
  { code: 'gl-ES', name: 'Galician', nativeName: 'Galego', supported: true },
  { code: 'cy-GB', name: 'Welsh', nativeName: 'Cymraeg', supported: true },
  { code: 'ga-IE', name: 'Irish', nativeName: 'Gaeilge', supported: true },
  { code: 'is-IS', name: 'Icelandic', nativeName: 'Íslenska', supported: true },
  { code: 'mt-MT', name: 'Maltese', nativeName: 'Malti', supported: true },
  { code: 'sq-AL', name: 'Albanian', nativeName: 'Shqip', supported: true },
  { code: 'mk-MK', name: 'Macedonian', nativeName: 'Македонски', supported: true },
  { code: 'bs-BA', name: 'Bosnian', nativeName: 'Bosanski', supported: true },
  { code: 'be-BY', name: 'Belarusian', nativeName: 'Беларуская', supported: true },
  { code: 'tl-PH', name: 'Tagalog', nativeName: 'Tagalog', supported: true },
  { code: 'jv-ID', name: 'Javanese', nativeName: 'Basa Jawa', supported: true },
  { code: 'su-ID', name: 'Sundanese', nativeName: 'Basa Sunda', supported: true },
  { code: 'so-SO', name: 'Somali', nativeName: 'Soomaali', supported: true },
  { code: 'ha-NG', name: 'Hausa', nativeName: 'Hausa', supported: true },
  { code: 'ps-AF', name: 'Pashto', nativeName: 'پښتو', supported: true },
  { code: 'ku-TR', name: 'Kurdish', nativeName: 'Kurdî', supported: true },
  { code: 'ckb-IQ', name: 'Kurdish (Sorani)', nativeName: 'کوردی', supported: true },
  { code: 'sd-PK', name: 'Sindhi', nativeName: 'سنڌي', supported: true },
  { code: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', supported: true },
  { code: 'as-IN', name: 'Assamese', nativeName: 'অসমীয়া', supported: true },
  { code: 'mai-IN', name: 'Maithili', nativeName: 'मैथिली', supported: true },
  { code: 'sa-IN', name: 'Sanskrit', nativeName: 'संस्कृतम्', supported: true },
  { code: 'doi-IN', name: 'Dogri', nativeName: 'डोगरी', supported: true },
  { code: 'kok-IN', name: 'Konkani', nativeName: 'कोंकणी', supported: true },
  { code: 'mni-IN', name: 'Manipuri', nativeName: 'মৈতৈলোন্', supported: true },
  { code: 'bo-CN', name: 'Tibetan', nativeName: 'བོད་སྐད', supported: true },
  { code: 'ug-CN', name: 'Uyghur', nativeName: 'ئۇيغۇرچە', supported: true },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (code: string) => void;
  compact?: boolean;
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  compact = false,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return LANGUAGES;
    const q = searchQuery.toLowerCase();
    return LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedLang = LANGUAGES.find((l) => l.code === selectedLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg border transition-colors',
          'hover:bg-white/5',
          compact
            ? 'px-2 py-1.5 text-xs'
            : 'px-3 py-2 text-sm'
        )}
        style={{
          borderColor: 'var(--border)',
          color: 'var(--foreground)',
          backgroundColor: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
        }}
      >
        <Globe className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        <span>{selectedLang?.name || selectedLanguage}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full right-0 z-50 mt-1 w-72 rounded-lg border shadow-xl"
            style={{
              backgroundColor: 'var(--sidebar)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-50" />
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border px-7 py-1.5 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                  autoFocus
                />
              </div>
              <p className="mt-1.5 text-[10px] opacity-50" style={{ color: 'var(--foreground)' }}>
                {LANGUAGES.length} languages available
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors',
                    'hover:bg-white/5'
                  )}
                  style={{ color: 'var(--foreground)' }}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs">{lang.name}</span>
                    <span className="text-[10px] opacity-50">{lang.nativeName}</span>
                  </div>
                  {lang.code === selectedLanguage && (
                    <Check className="h-3.5 w-3.5 text-blue-400" />
                  )}
                </button>
              ))}
              {filteredLanguages.length === 0 && (
                <p className="p-3 text-center text-xs opacity-50" style={{ color: 'var(--foreground)' }}>
                  No languages match your search
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
