import pdfjs from 'npm:pdfjs-dist'

export async function pdfMetadata(filename: string) {
  const buf = await Deno.readFile(filename)
  const pdf = await pdfjs.getDocument(buf).promise

  // TODO kind of gross that it just returns pdfjs' metadata object. Leaky
  // abstraction.
  const metadata = await pdf.getMetadata()
  return metadata
}

export default pdfMetadata
