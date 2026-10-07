import fs from 'fs'
import path from 'path'
import readline from 'readline'
import DatasetClient from './DatasetClient'

export default async function DatasetPage() {
  const filePath = path.join(process.cwd(), 'public', 'DataCoSupplyChainDataset.csv')
  const data: Record<string, string>[] = []

  try {
    const fileStream = fs.createReadStream(filePath)
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    let headers: string[] = []
    let count = 0

    for await (const line of rl) {
      // Basic CSV splitting (handling basic quotes)
      const row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim())
      
      if (headers.length === 0) {
        headers = row
        continue
      }
      
      if (row.length === headers.length) {
        const rowData: Record<string, string> = {}
        headers.forEach((header, index) => {
          rowData[header] = row[index]
        })
        data.push(rowData)
        count++
      }

      // Load 1000 records for the preview table to prevent server/browser crashes
      if (count >= 1000) {
        rl.close()
        break
      }
    }
  } catch (error) {
    console.error("Error reading CSV:", error)
  }

  return <DatasetClient data={data} />
}
