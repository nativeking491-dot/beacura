import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Because we are relying heavily on AI for dynamic translations of daily tips and custom text,
// the static dictionary here only serves the core UI bounds (Navigation, Buttons, Labels).
// We'll define inline resources here for speed, avoiding external JSON loads for core UI.

const resources = {
  en: {
    translation: {
      nav: {
        dashboard: "Dashboard",
        community: "Community",
        counseling: "Counseling",
        health: "Health",
        journal: "Journal",
        paths: "Healing Paths",
        profile: "Profile"
      },
      common: {
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete"
      },
      avatar: {
        mute: "Mute AI Voice",
        unmute: "Unmute AI Voice",
        dismiss: "Dismiss Avatar",
        talkingToYou: "Connecting to Dr. "
      }
    }
  },
  es: {
    translation: {
      nav: {
        dashboard: "Panel",
        community: "Comunidad",
        counseling: "Asesoramiento",
        health: "Salud",
        journal: "Diario",
        paths: "Caminos de Sanación",
        profile: "Perfil"
      },
      common: {
        loading: "Cargando...",
        save: "Guardar",
        cancel: "Cancelar",
        edit: "Editar",
        delete: "Eliminar"
      },
      avatar: {
        mute: "Silenciar Voz AI",
        unmute: "Activar Voz AI",
        dismiss: "Ocultar Avatar",
        talkingToYou: "Conectando con Dr. "
      }
    }
  },
  jp: {
    translation: {
      nav: {
        dashboard: "ダッシュボード",
        community: "コミュニティ",
        counseling: "カウンセリング",
        health: "健康",
        journal: "日記",
        paths: "癒やしの道",
        profile: "プロフィール"
      },
      common: {
        loading: "読み込み中...",
        save: "保存",
        cancel: "キャンセル",
        edit: "編集",
        delete: "削除"
      },
      avatar: {
        mute: "AI音声をミュート",
        unmute: "AI音声をミュート解除",
        dismiss: "アバターを隠す",
        talkingToYou: "接続中: 先生 "
      }
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React already safeguards from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
