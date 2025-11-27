import { PDFDocument } from "pdf-lib";

export type PdfResult = {
  blob: Blob;
  url: string;
  pageCount: number;
};

const readFile = (file: File) => file.arrayBuffer();

const createBlobFromPdf = async (pdfDoc: PDFDocument): Promise<PdfResult> => {
  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  return { blob, url, pageCount: pdfDoc.getPageCount() };
};

export const pdfToolsService = {
  async getPageCount(file: File): Promise<number> {
    const data = await readFile(file);
    const doc = await PDFDocument.load(data);
    return doc.getPageCount();
  },

  async mergePdfs(files: File[]): Promise<PdfResult> {
    if (files.length < 2) {
      throw new Error("At least two PDFs are required to merge.");
    }
    const mergedDoc = await PDFDocument.create();

    for (const file of files) {
      const data = await readFile(file);
      const doc = await PDFDocument.load(data);
      const copiedPages = await mergedDoc.copyPages(
        doc,
        doc.getPageIndices()
      );
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    }

    return createBlobFromPdf(mergedDoc);
  },

  async extractPages(
    file: File,
    from: number,
    to: number
  ): Promise<PdfResult> {
    const data = await readFile(file);
    const sourceDoc = await PDFDocument.load(data);
    const totalPages = sourceDoc.getPageCount();

    const startIndex = Math.max(0, Math.min(from - 1, totalPages - 1));
    const endIndex = Math.max(startIndex, Math.min(to - 1, totalPages - 1));

    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(
      sourceDoc,
      Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i)
    );
    pages.forEach((page) => newDoc.addPage(page));

    return createBlobFromPdf(newDoc);
  },
};

/**
 * TODO: Consider moving heavy PDF operations into a Web Worker and adding
 * incremental feedback for huge documents. Future enhancements could also
 * include splitting, watermarking, or compression pipelines.
 */
