// import { monthToMM } from './utils.ts'
import * as path from 'https://deno.land/std/path/mod.ts'

function makeBasename(publisherName: string, acctNumber: string, periodEndDate: string, extname: string): string {
  const acctNumberLast4 = acctNumber.substring(acctNumber.length - 4)
  return [publisherName, acctNumberLast4, periodEndDate].join('-') + extname
}

export async function getNewFilename(filename: string): Promise<string> {
  const dirname = path.dirname(filename)
  const extname = path.extname(filename)

  // TODO use ps2ascii directly, not lesspipe
  const command = new Deno.Command('less', {
    args: [
      filename
    ]
  })

  const result = await command.output()
  const textDecoder = new TextDecoder()
  const fileContents = textDecoder.decode(result.stdout)

  // TODO this seems pretty inefficient: subprocess out, load the entire
  // subprocess' stdout, regexp a bunch against it... yuck. Also brittle.

  // TODO implement TSP.gov statement

  if (/Marcus\.com/.test(fileContents)) {
    const dateMatch = fileContents.match(/STATEMENT SUMMARY as of (\d{2})\/(\d{2})\/(\d{4})/)
    const [mm, dd, yyyy] = dateMatch.slice(1, 4)
    const acctNumberMatch = fileContents.match(/Account Number\s+(\d+)/)
    const acctNumber = acctNumberMatch[1]
    return path.join(dirname, makeBasename('Marcus', acctNumber, `${yyyy}-${mm}-${dd}`, extname))

  } else if (/EverBank/.test(fileContents)) {
    const dateMatch = fileContents.match(/PPDPNTA(\d{4})(\d{2})(\d{2})/)
    const [yyyy, mm, dd] = dateMatch.slice(1, 4)
    const acctNumberMatch = fileContents.match(/Statement of Account\s+(\d+)$/m)
    const acctNumber = acctNumberMatch[1]
    return path.join(dirname, makeBasename('EverBank', acctNumber, `${yyyy}-${mm}-${dd}`, extname))

  } else if (/Vanguard Group/.test(fileContents)) {
    const dateMatch = fileContents.match(/(202[3-9])([0-1][0-9])([0-3][0-9])/) // not exactly right, but good enough
    const [yyyy, mm, dd] = dateMatch.slice(1, 4)
    const acctNumberMatch = fileContents.match(/account\S(\d+)/)
    const acctNumber = acctNumberMatch[1]
    return path.join(dirname, makeBasename('Vanguard', acctNumber, `${yyyy}-${mm}-${dd}`, extname))

  } else if (/Vanguard 529/.test(fileContents)) {
    const dateMatch = fileContents.match(/(202[3-9])([0-1][0-9])([0-3][0-9])/) // not exactly right, but good enough
    const [yyyy, mm, dd] = dateMatch.slice(1, 4)
    const acctNumberMatch = fileContents.match(/Account number: (\d+)/)
    const acctNumber = acctNumberMatch[1]
    return path.join(dirname, makeBasename('Vanguard', acctNumber, `${yyyy}-${mm}-${dd}`, extname))

  } else if (/University of California/.test(fileContents)) {
    const dateMatch = fileContents.match(/Statement Period: \d{2}\/\d{2}\/\d{4} to (\d{2})\/(\d{2})\/(\d{4})/)
    const [mm, dd, yyyy] = dateMatch.slice(1, 4)
    const acctNumber = 'VLT' // TODO assume for now that VLT is the only person with a fidelity netbenefits acct
    return path.join(dirname, makeBasename('Fidelity-UCSF', acctNumber, `${yyyy}-${mm}-${dd}`, extname))

  } else if (/Fidelity\.com/.test(fileContents)) {
    const dateMatch = fileContents.match(/(202[3-9])([0-1][0-9])([0-3][0-9])/) // not exactly right, but good enough
    const [yyyy, mm, dd] = dateMatch.slice(1, 4)

    let acctNumber

    if (/huned/i.test(fileContents)) {
      acctNumber = 'HMB'
    } else if (/victoria/i.test(fileContents)) {
      acctNumber = 'VLT'
    } else if (/maya/i.test(fileContents)) {
      acctNumber = 'MTB'
    } else if (/anika/i.test(fileContents)) {
      acctNumber = 'ATB'
    } else if (/raziya/i.test(fileContents)) {
      acctNumber = 'RMB'
    }

    return path.join(dirname, makeBasename('Fidelity', acctNumber, `${yyyy}-${mm}-${dd}`, extname))

  } else if (/DISCOVER IT.* CARD/.test(fileContents)) {
    const dateMatch = fileContents.match(/Account Summary\s+(\d{2})\/(\d{2})\/(\d{4}) - (\S+)/)
    const [mm, dd, yyyy] = dateMatch.slice(1, 4)
    const acctNumberMatch = fileContents.match(/CARD ENDING IN (\d{4})/)
    const acctNumberLast4 = acctNumberMatch[1]
    return path.join(dirname, makeBasename('Discover', acctNumberLast4, `${yyyy}-${mm}-${dd}`, extname))

  } else if (/www\.citicards\.com/.test(fileContents)) {
    const dateMatch = fileContents.match(/Billing Period: \d{2}\/\d{2}\/\d{2}-(\d{2})\/(\d{2})\/(\d{2})/)
    const [mm, dd, yy] = dateMatch.slice(1, 4)
    const yyyy = `20${yy}`
    const acctNumberMatch = fileContents.match(/Account number ending in: (\d{4})/)
    const acctNumberLast4 = acctNumberMatch[1]
    return path.join(dirname, makeBasename('Citi', acctNumberLast4, `${yyyy}-${mm}-${dd}`, extname))

  // } else if (/TrustHome Properties/.test(fileContents)) {
  //   const dateMatch = fileContents.match(/Period: \d{2} \w{3} 202\d-(\d{2}) (\w{3}) (202\d)/)
  //   const [dd, yyyy] = [dateMatch[1], dateMatch[3]]
  //   const mm = monthToMM(dateMatch[2])
  //   const acctName = 'TODO' // TODO
  //   return `TrustHome ${acctName} ${yyyy}-${mm}-${dd}`

  // } else if (/Keller Williams Realty Memphis/.test(fileContents)) {
  //   const dateMatch = fileContents.match(/Period: \d{2} \w{3} 202\d-(\d{2}) (\w{3}) (202\d)/)
  //   const [dd, yyyy] = [dateMatch[1], dateMatch[3]]
  //   const mm = monthToMM(dateMatch[2])
  //   const acctName = 'TODO' // TODO
  //   return `KW Memphis ${acctName} ${yyyy}-${mm}-${dd}`

  } else {
    throw new Error(`Can't generate new filename for unrecognized file "${filename}" - skip it.`)
  }
}

export async function magicRename(filename: string): Promise<boolean> {
  let newFilename

  try {
    newFilename = await getNewFilename(filename)

    if (newFilename && newFilename.length > 0 && newFilename !== filename) {
      console.log(`Rename "${filename}" to "${newFilename}"`)
      await Deno.rename(filename, newFilename)
      return true
    }
  } catch (error) {
    console.error(error)
    return false
  }
}

export default magicRename
