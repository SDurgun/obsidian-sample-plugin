import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

/**
 * Liefert eine Zeilen‑Dekoration für normale Inhaltzeilen im Block.
 * Fügt die Basisklasse "cm-calclue-mathmode" und zusätzlich "cm-{mode}" hinzu, falls ein Modus angegeben ist.
 */
function getLineDecoration(mode: string): Decoration {
  let classes = "cm-calclue-mathmode";
  if (mode && mode.length > 0) {
    classes += " cm-" + mode;
  }
  return Decoration.line({ class: classes });
}

/**
 * Liefert eine Inline‑Dekoration für den Markerbereich (die ersten drei Zeichen ":::").
 * Damit kannst Du diesen Bereich separat per CSS stylen.
 */
function markerInlineDeco(): Decoration {
  return Decoration.mark({ class: "cm-calclue-mathmode-marker" });
}

/**
 * Liefert eine Inline‑Dekoration für den Rest der Startmarker‑Zeile (also den Teil mit dem Schlüsselwort).
 * Hier wird die Container‑Klasse (plus ggf. "cm-{mode}") angewendet.
 */
function contentInlineDeco(mode: string): Decoration {
  let classes = "cm-calclue-mathmode";
  if (mode && mode.length > 0) {
    classes += " cm-" + mode;
  }
  return Decoration.mark({ class: classes });
}

/**
 * Diese ViewPlugin‑Klasse durchsucht das Dokument zeilenweise nach Blöcken,
 * die durch Marker‑Zeilen definiert sind.
 *
 * • Eine Startmarker‑Zeile beginnt mit ":::". Darin kann ein Schlüsselwort stehen, z. B. "::: thm" oder ":::thm".
 *   Hier wird der Modus über substring extrahiert und in Kleinbuchstaben umgewandelt.
 *   - Die ersten drei Zeichen (":::") werden mit markerInlineDeco dekoriert.
 *   - Der Rest der Zeile (ab Zeichen 4) erhält contentInlineDeco, wobei der extrahierte Modus übernommen wird.
 *
 * • Alle folgenden Zeilen im Block (bis zum Endmarker) werden zeilenweise mit getLineDecoration dekoriert.
 *
 * • Eine Endmarker‑Zeile (die exakt ":::" enthält) wird komplett als Marker dekoriert.
 */
class CalclueMathModeViewPlugin {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  private buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;
    const lineCount = doc.lines;
    let inBlock = false;
    let currentMode = "";
    
    for (let i = 1; i <= lineCount; i++) {
      const line = doc.line(i);
      const trimmed = line.text.trim();
      
      if (!inBlock && trimmed.startsWith(":::")) {
        // Startmarker-Zeile gefunden – extrahiere den Modus.
        // Verwende substring, um auch ":::thm" zu erfassen.
        currentMode = trimmed.substring(3).trim().toLowerCase();
        inBlock = true;
        // Dekoriere die Startmarker‑Zeile:
        // – Die ersten drei Zeichen (":::") werden als Marker dekoriert.
        if (line.to - line.from >= 3) {
          builder.add(line.from, line.from + 3, markerInlineDeco());
          // – Der Rest der Zeile (falls vorhanden) erhält contentInlineDeco mit currentMode.
          if (line.from + 3 < line.to) {
            builder.add(line.from + 3, line.to, contentInlineDeco(currentMode));
          }
        } else {
          builder.add(line.from, line.to, markerInlineDeco());
        }
      } else if (inBlock && trimmed === ":::" ) {
        // Endmarker-Zeile gefunden – dekoriere sie komplett als Marker.
        builder.add(line.from, line.to, markerInlineDeco());
        inBlock = false;
        currentMode = "";
      } else {
        // Innerhalb eines Blocks: Dekoriere die Zeile als Blockinhalt.
        if (inBlock) {
          builder.add(line.from, line.from, getLineDecoration(currentMode));
        }
      }
    }
    
    return builder.finish();
  }
}

export const calclueMathModePlugin = ViewPlugin.fromClass(CalclueMathModeViewPlugin, {
  decorations: v => v.decorations
});
