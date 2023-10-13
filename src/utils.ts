export function monthToMM(monthStr: string): string {
  const lookups = {
    jan: '01', feb: '02', mar: '03',
    apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09',
    oct: '10', nov: '11', dec: '12'
  }

  const key = monthStr.substring(0, 3).toLowerCase()
  const val = lookups[key]

  if (val === undefined) {
    throw new Error(`"${monthStr}" should be a month (eg, August) or month abbreviation (eg, Aug)`)
  }

  return lookups[key]
}

export default monthToMM
