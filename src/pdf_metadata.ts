import pdfjs from 'npm:pdfjs-dist'

export async function pdfMetadata(filename: string) {
  const buf = await Deno.readFile(filename)
  const pdf = await pdfjs.getDocument(buf).promise
  const metadata = await pdf.getMetadata()
  return metadata
}

export default pdfMetadata
