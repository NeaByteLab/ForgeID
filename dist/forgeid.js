const os = require('os')
const crypto = require('crypto')

class ForgeID {
  constructor(secret = 'forgeid-secret', startYear = 1970, baseLength = 10, intervalYears = 10) {
    this.secretKey = secret
    this.yearBegin = startYear
    this.initialLength = baseLength
    this.growthInterval = intervalYears
  }

  hashFingerprint(input) {
    let result = 0
    for (let i = 0; i < input.length; i++) {
      result = (result << 5) - result + input.charCodeAt(i)
    }
    return result >>> 0
  }

  getMachineSignature() {
    try {
      const deviceName = os.hostname?.() || ''
      const adapters = os.networkInterfaces()
      for (const adapterName in adapters) {
        for (const adapter of adapters[adapterName]) {
          if (!(adapter.internal) && adapter.mac && adapter.mac !== '00:00:00:00:00:00') {
            const key = `${deviceName}-${adapter.mac}`
            return (this.hashFingerprint(key) % 1048576).toString(36)
          }
        }
      }
      return (this.hashFingerprint(deviceName) % 1048576).toString(36)
    } catch {
      return Math.floor(Math.random() * 1048576).toString(36)
    }
  }

  encodeBase62(buffer) {
    return buffer.toString('base64').replace(/[^a-zA-Z0-9]/g, '')
  }

  getDynamicLength() {
    const currentYear = new Date().getFullYear()
    const elapsed = currentYear - this.yearBegin
    return this.initialLength + Math.floor(elapsed / this.growthInterval)
  }

  generate() {
    const lengthTarget = this.getDynamicLength()
    const randomSource = this.encodeBase62(crypto.randomBytes(12))
    const deviceSignature = this.getMachineSignature()
    const timeStamp = Date.now().toString(36)
    const baseContent = `${randomSource}${deviceSignature}${timeStamp}`.slice(0, lengthTarget)
    const signature = crypto.createHmac('sha256', this.secretKey).update(baseContent).digest('hex').slice(0, 10).toLowerCase()
    return baseContent + signature
  }

  verify(code) {
    if (!(code) || typeof code !== 'string' || code.length <= 10) {
      return false
    }
    const dataPortion = code.slice(0, -10)
    const givenSignature = code.slice(-10).toLowerCase()
    const expectedSignature = crypto.createHmac('sha256', this.secretKey).update(dataPortion).digest('hex').slice(0, 10).toLowerCase()
    return givenSignature === expectedSignature
  }

  stressTest(total = 1e6, progressStep = 1e5) {
    const ids = new Set()
    const started = Date.now()
    let duplicateCount = 0
    let invalidCount = 0
    for (let index = 1; index <= total; index++) {
      const key = this.generate()
      if (ids.has(key)) {
        duplicateCount++
      } else {
        ids.add(key)
      }
      if (!(this.verify(key))) {
        invalidCount++
      }
      if (index % progressStep === 0) {
        const timeSpent = ((Date.now() - started) / 1000).toFixed(2)
        const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
        console.log(`🧪 ${index.toLocaleString()} keys | Duplicates: ${duplicateCount} | Invalid: ${invalidCount} | Time: ${timeSpent}s | RAM: ${memoryUsed} MB`)
      }
    }
    const totalDuration = ((Date.now() - started) / 1000).toFixed(2)
    console.log(`\n✅ Done: ${total.toLocaleString()} keys`)
    console.log(`⏱️  Total time: ${totalDuration}s`)
    console.log(`🧬 Unique: ${ids.size.toLocaleString()}`)
    console.log(`⚠️  Duplicates: ${duplicateCount}`)
    console.log(`❌ Invalid: ${invalidCount}`)
  }
}

module.exports = ForgeID