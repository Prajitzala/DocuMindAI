import { pathToFileURL } from "node:url";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

let workerConfigured = false;

function ensurePdfWorker() {
  if (workerConfigured) {
    return;
  }
  PDFParse.setWorker(pathToFileURL(getPath()).href);
  workerConfigured = true;
}

/**
 * Parse a PDF buffer into text chunks with page metadata.
 * @param {Buffer} fileBuffer - Raw PDF bytes
 * @returns {Promise<import("@langchain/core/documents").Document[]>}
 */
export async function parsePDF(fileBuffer) {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error("parsePDF requires a valid Buffer");
  }

  if (fileBuffer.length === 0) {
    throw new Error("parsePDF received an empty buffer");
  }

  ensurePdfWorker();
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();
    const pageDocuments = (result.pages ?? [])
      .filter((page) => page.text?.trim())
      .map(
        (page) =>
          new Document({
            pageContent: page.text,
            metadata: { loc: { pageNumber: page.num } },
          })
      );

    if (!pageDocuments.length) {
      throw new Error(
        "No text content could be extracted from the PDF. The file may be empty or image-only."
      );
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });

    return splitter.splitDocuments(pageDocuments);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith("parsePDF") ||
        error.message.startsWith("No text content"))
    ) {
      throw error;
    }

    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse PDF: ${detail}`);
  } finally {
    await parser.destroy();
  }
}
