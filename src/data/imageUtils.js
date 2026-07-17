// Wandelt eine ausgewählte Bilddatei in eine komprimierte Data-URL um,
// die direkt im Rezept gespeichert werden kann (kein Backend/Upload
// nötig). Verkleinerung ist wichtig, weil localStorage nur ein paar
// MB Platz hat - unkomprimierte Handy-Fotos (oft 3-5 MB) würden den
// Speicher schnell sprengen.

const MAX_WIDTH = 1000;
const JPEG_QUALITY = 0.8;

export function fileToCompressedDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Das ist keine Bilddatei."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
