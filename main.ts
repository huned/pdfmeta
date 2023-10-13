import { pdfMetadata } from './src/pdf_metadata.ts'

if (import.meta.main) {
  const textEncoder = new TextEncoder()

  for (const arg of Deno.args) {
    const filename = arg

    if (filename.endsWith('.pdf')) {
      const fileInfo = await Deno.stat(filename)

      if (fileInfo.isFile) {
        const metadata = await pdfMetadata(filename)
        Deno.stdout.write(textEncoder.encode(JSON.stringify(metadata, null, 2)))
        Deno.stdout.write(textEncoder.encode('\n'))
      }
    }
  }
}
