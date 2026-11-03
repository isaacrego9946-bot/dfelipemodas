export async function compressPhoto(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 960;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível ler a imagem.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.72;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > 90000 && quality > 0.4) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > 100000) {
    throw new Error("Essa foto ficou grande demais. Escolha outra imagem do WhatsApp.");
  }
  return dataUrl;
}
