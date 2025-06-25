const ForgeID = require('../dist/forgeid.min.js')
const fs = require('fs')

const forge = new ForgeID()
const steps = [100_000, 200_000, 300_000, 400_000, 500_000, 600_000, 700_000, 800_000, 900_000, 1_000_000]
const results = []

async function benchmark() {
  const ids = new Set()
  const started = Date.now()
  for (let index = 1; index <= steps[steps.length - 1]; index++) {
    const id = forge.generate()
    ids.add(id)
    if (steps.includes(index)) {
      const now = Date.now()
      const timeSpent = ((now - started) / 1000).toFixed(2)
      const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
      console.log(`🧪 ${index.toLocaleString()} keys | Time: ${timeSpent}s | RAM: ${ramUsed} MB`)
      results.push({
        keys: index,
        seconds: parseFloat(timeSpent),
        ramMB: parseFloat(ramUsed)
      })
    }
  }
  fs.writeFileSync('./benchmark/benchmark.json', JSON.stringify(results, null, 2))
  const csv = `keys,seconds,ramMB\n` + results.map(r => `${r.keys},${r.seconds},${r.ramMB}`).join('\n')
  fs.writeFileSync('./benchmark/benchmark.csv', csv)
  console.log('\n✅ Benchmark finished')
}

benchmark()