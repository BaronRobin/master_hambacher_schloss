import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  de: {
    translation: {
      "app.title": "Hambacher Schloss Demokratie-Simulator",
      "checkin.title": "Willkommen am Hambacher Schloss",
      "checkin.prompt": "Bitte gib deinen Ticket-Code ein",
      "checkin.button": "Block Zuweisen",
      "editor.title": "Dein Baustein",
      "editor.brush": "Pinselgröße",
      "editor.color": "Farbe",
      "editor.clear": "Leeren",
      "editor.undo": "Rückgängig",
      "editor.confirm": "Fertig! Block platzieren",
      "editor.outfacing": "Außenseite (wird sichtbar sein)",
      "placer.title": "Finde deinen Platz",
      "placer.preview": "Vorschau",
      "placer.confirm": "Hier platzieren",
      "placer.cancel": "Anderen Platz wählen",
      "error.floating": "Ungültig! Ein Block muss auf einem anderen Block oder dem Boden platziert werden."
    }
  },
  en: {
    translation: {
      "app.title": "Hambacher Schloss Democracy Simulator",
      "checkin.title": "Welcome to the Hambacher Schloss",
      "checkin.prompt": "Please enter your ticket code",
      "checkin.button": "Assign Block",
      "editor.title": "Your Building Block",
      "editor.brush": "Brush Size",
      "editor.color": "Color",
      "editor.clear": "Clear",
      "editor.undo": "Undo",
      "editor.confirm": "Done! Place Block",
      "editor.outfacing": "Outfacing side (will be visible)",
      "placer.title": "Find your spot",
      "placer.preview": "Preview",
      "placer.confirm": "Place here",
      "placer.cancel": "Choose other spot",
      "error.floating": "Invalid! A block must be placed on another block or the ground."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "de", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
