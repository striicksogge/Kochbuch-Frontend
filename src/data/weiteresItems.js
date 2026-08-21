import { Upload, Tag, Bug, Lightbulb, Moon, ImageDown } from "lucide-react";

/**
 * Gemeinsame Liste der sechs "Weiteres"-Punkte, geteilt zwischen dem
 * mobilen Speed-Dial (components/WeiteresMenu.jsx) und dem
 * ausklappbaren Untermenü der Desktop-Seitenleiste
 * (components/Sidebar.jsx). Jede "id" entspricht einem Panel in
 * components/WeiteresPanels.jsx.
 */
export const WEITERES_ITEMS = [
  { id: "idea", icon: Lightbulb, label: "Ideen für REZIPI" },
  { id: "bug", icon: Bug, label: "Fehler melden" },
  { id: "add-category", icon: Tag, label: "Kategorien hinzufügen" },
  { id: "import-export", icon: Upload, label: "Import/Export" },
  { id: "theme", icon: Moon, label: "Darstellung" },
  { id: "image-download", icon: ImageDown, label: "Bild-Download" },
];
