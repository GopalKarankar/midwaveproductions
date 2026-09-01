import { normalizeArtistForPdf } from "./normalizeArtistForPdf";

export async function exportArtistPortfolioPdf(artist) {
  const normalized = normalizeArtistForPdf(artist);
  if (!normalized) return;

  try {
    const { pdf } = await import("@react-pdf/renderer");
    const { ArtistPortfolioDocument } = await import("./ArtistPortfolioDocument");

    const doc = <ArtistPortfolioDocument artist={normalized} />;
    const blob = await pdf(doc).toBlob();

    const url = URL.createObjectURL(blob);
    const filename = `${normalized.slug || normalized.stageName?.toLowerCase().replace(/\s+/g, "-") || "portfolio"}-portfolio.pdf`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to export PDF:", err);
    alert("Failed to export portfolio as PDF. Please try again.");
  }
}
