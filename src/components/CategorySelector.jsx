import { useState } from "react";
import { Check } from "lucide-react";
import { CATEGORY_GROUPS } from "../data/categories";

/**
 * Zweistufige Kategorie-Auswahl:
 *  - Ebene 1: Gruppen-Chips (Mahlzeit, Ernährung, …)
 *  - Ebene 2: Checkbox-Liste der Gruppe, klappt beim Klick auf den
 *    Chip auf; erneuter Klick (oder Klick auf eine andere Gruppe)
 *    klappt sie wieder zu. Immer nur eine Gruppe gleichzeitig offen.
 *
 * `selected` / `onChange` arbeiten mit einer flachen Liste aller
 * gewählten Kategorie-Namen, gruppenübergreifend.
 */
export default function CategorySelector({ selected = [], onChange }) {
  const [openGroupId, setOpenGroupId] = useState(null);

  function toggleGroup(groupId) {
    setOpenGroupId((current) => (current === groupId ? null : groupId));
  }

  function toggleOption(option) {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div>
      {/* Ebene 1 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_GROUPS.map((group) => {
          const countInGroup = group.options.filter((o) => selected.includes(o)).length;
          const isOpen = openGroupId === group.id;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => toggleGroup(group.id)}
              className={`flex items-center gap-1.5 rounded-[var(--radius-chip)] border px-3.5 py-2 text-sm transition-colors ${
                isOpen
                  ? "border-olive bg-olive text-cream"
                  : countInGroup > 0
                    ? "border-olive bg-olive/10 text-olive-deep"
                    : "border-sand-line bg-cream-card text-ink"
              }`}
            >
              <span>{group.emoji}</span>
              {group.label}
              {countInGroup > 0 && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 text-xs ${
                    isOpen ? "bg-cream/25" : "bg-olive text-cream"
                  }`}
                >
                  {countInGroup}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ebene 2 */}
      {openGroupId && (
        <div className="mt-3 rounded-[var(--radius-card)] border border-sand-line bg-cream-card p-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_GROUPS.find((g) => g.id === openGroupId).options.map((option) => {
              const isChecked = selected.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleOption(option)}
                  className={`flex items-center gap-1 rounded-[var(--radius-chip)] border px-3 py-1.5 text-sm transition-colors ${
                    isChecked
                      ? "border-olive bg-olive text-cream"
                      : "border-sand-line bg-cream text-ink"
                  }`}
                >
                  {isChecked && <Check size={13} strokeWidth={3} />}
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gewählte Kategorien gruppenübergreifend, damit man sie auch
          ohne offene Gruppe sieht/entfernen kann */}
      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selected.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className="flex items-center gap-1 rounded-[var(--radius-chip)] bg-ink/5 px-2.5 py-1 text-xs text-ink-soft"
              aria-label={`${option} entfernen`}
            >
              {option} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
