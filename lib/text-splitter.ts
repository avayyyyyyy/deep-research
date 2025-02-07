interface TextSplitterParams {
  chunkSize: number;
  chunkOverlap: number;
}

abstract class TextSplitter implements TextSplitterParams {
  chunkSize = 1000;
  chunkOverlap = 200;

  constructor(fields?: Partial<TextSplitterParams>) {
    this.chunkSize = fields?.chunkSize ?? this.chunkSize;
    this.chunkOverlap = fields?.chunkOverlap ?? this.chunkOverlap;
    this.validateChunkSizes();
  }

  private validateChunkSizes() {
    if (this.chunkOverlap >= this.chunkSize) {
      throw new Error('Cannot have chunkOverlap >= chunkSize');
    }
  }

  abstract splitText(text: string): string[];

  createDocuments(texts: string[]): string[] {
    return texts.flatMap(text => this.splitText(text));
  }

  splitDocuments(documents: string[]): string[] {
    return this.createDocuments(documents);
  }

  protected joinDocs(docs: string[], separator: string): string | null {
    const text = docs.join(separator).trim();
    return text || null;
  }

  protected mergeSplits(splits: string[], separator: string): string[] {
    const docs: string[] = [];
    const currentDoc: string[] = [];
    let total = 0;

    const processBatch = () => {
      const doc = this.joinDocs(currentDoc, separator);
      if (doc) docs.push(doc);
    };

    const trimCurrentDoc = (nextLength: number) => {
      while (
        total > this.chunkOverlap ||
        (total + nextLength > this.chunkSize && total > 0)
      ) {
        const firstLength = currentDoc[0]?.length || 0;
        total -= firstLength;
        currentDoc.shift();
      }
    };

    for (const split of splits) {
      const splitLength = split.length;

      if (total + splitLength >= this.chunkSize) {
        if (total > this.chunkSize) {
          console.warn(
            `Created a chunk of size ${total}, which is longer than the specified ${this.chunkSize}`
          );
        }
        
        if (currentDoc.length) {
          processBatch();
          trimCurrentDoc(splitLength);
        }
      }

      currentDoc.push(split);
      total += splitLength;
    }

    processBatch();
    return docs;
  }
}

export interface RecursiveCharacterTextSplitterParams extends TextSplitterParams {
  separators: string[];
}

export class RecursiveCharacterTextSplitter
  extends TextSplitter
  implements RecursiveCharacterTextSplitterParams 
{
  separators: string[] = ['\n\n', '\n', '.', ',', '>', '<', ' ', ''];

  constructor(fields?: Partial<RecursiveCharacterTextSplitterParams>) {
    super(fields);
    this.separators = fields?.separators ?? this.separators;
  }

  private findAppropiateSeparator(text: string): string {
    return this.separators.find(separator => 
      separator === '' || text.includes(separator)
    ) || '';
  }

  private splitTextBySeparator(text: string, separator: string): string[] {
    return separator ? text.split(separator) : text.split('');
  }

  splitText(text: string): string[] {
    const finalChunks: string[] = [];
    const separator = this.findAppropiateSeparator(text);
    const splits = this.splitTextBySeparator(text, separator);
    let goodSplits: string[] = [];

    const processPendingSplits = () => {
      if (goodSplits.length) {
        const mergedText = this.mergeSplits(goodSplits, separator);
        finalChunks.push(...mergedText);
        goodSplits = [];
      }
    };

    for (const split of splits) {
      if (split.length < this.chunkSize) {
        goodSplits.push(split);
      } else {
        processPendingSplits();
        const recursiveSplits = this.splitText(split);
        finalChunks.push(...recursiveSplits);
      }
    }

    processPendingSplits();
    return finalChunks;
  }
}