import { useState } from "react";
import { Link } from "react-router-dom";
import { FlaskConical, ChevronDown, MessageCircle } from "lucide-react";
import { getImportsRemaining, hasReachedImportLimit, TESTER_IMPORT_LIMIT } from "../data/testerMode";

/** Erkennt, ob die Seite gerade als installierte App läuft (Startbildschirm-Icon),
 * statt als normaler Browser-Tab - funktioniert für Android/Chrome und iOS/Safari. */
function isRunningStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

/**
 * Sichtbarer Hinweis im Testmodus (siehe data/testerMode.js), damit auf jedem
 * Gerät - insbesondere iPhone - auf einen Blick klar ist, ob der Testmodus aktiv
 * ist. Zusätzlich ein Hinweis, die App zu installieren: Auf iOS werden normale
 * Safari-Tabs nach 7 Tagen Inaktivität von Apples Speicherbereinigung erfasst,
 * als Home-Bildschirm-App installierte Seiten sind davon ausdrücklich
 * ausgenommen - dadurch bleibt das Test-Limit zuverlässig bestehen.
 */
export default function TesterModeBanner() {
  const [expanded, setExpanded] = useState(false);
  const installed = isRunningStandalone();

  return (
    <div className="mx-4 mt-3 rounded-[var(--radius-card)] border border-honey/40 bg-honey/10 p-3">
      <div className="flex items-center gap-2 text-sm text-ink">
        <FlaskConical size={16} className="shrink-0 text-honey" />
        {hasReachedImportLimit() ? (
          <span>
            Test-Limit erreicht – Import gesperrt, die App bleibt aber ganz normal nutzbar.
          </span>
        ) : (
          <span>
            Testversion – noch {getImportsRemaining()} von {TESTER_IMPORT_LIMIT} Test-Importen übrig
          </span>
        )}
      </div>

      <Link
        to="/feedback"
        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-olive-deep underline"
      >
        <MessageCircle size={13} /> Feedback geben / Fehler melden
      </Link>

      {!installed && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 flex items-center gap-1 text-xs text-ink-soft underline"
          >
            Zum Home-Bildschirm hinzufügen (empfohlen)
            <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          {expanded && (
            <div className="mt-2 space-y-1 text-xs leading-relaxed text-ink-soft">
              <p><strong>iPhone:</strong> Teilen-Symbol antippen → „Zum Home-Bildschirm"</p>
              <p><strong>Android:</strong> Menü (⋮) antippen → „App installieren" bzw. „Zum Startbildschirm hinzufügen"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
