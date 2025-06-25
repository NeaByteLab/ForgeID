const os = require('os')
const crypto = require('crypto')

class ForgeID {
  constructor(secretKey = 'forgeid-secret', startYear = 1970, baseLength = 10, intervalYears = 10) {
    this.secretKey = secretKey
    this.yearBegin = startYear
    this.initialLength = baseLength
    this.growthInterval = intervalYears
  }

  hashFingerprint(text) {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i)
    }
    return hash >>> 0
  }

  getMachineSignature() {
    try {
      const hostname = os.hostname?.() || ''
      const networkInterfaces = os.networkInterfaces()
      for (const adapterName in networkInterfaces) {
        for (const adapter of networkInterfaces[adapterName]) {
          if (!(adapter.internal) && adapter.mac && adapter.mac !== '00:00:00:00:00:00') {
            const fingerprintKey = `${hostname}-${adapter.mac}`
            return (this.hashFingerprint(fingerprintKey) % 1048576).toString(36)
          }
        }
      }
      return (this.hashFingerprint(hostname) % 1048576).toString(36)
    } catch {
      return Math.floor(Math.random() * 1048576).toString(36)
    }
  }

  encodeBase62(buffer) {
    return buffer.toString('base64').replace(/[^a-zA-Z0-9]/g, '')
  }

  getDynamicLength() {
    const yearNow = new Date().getFullYear()
    const elapsedYears = yearNow - this.yearBegin
    return this.initialLength + Math.floor(elapsedYears / this.growthInterval)
  }

  generate(prefix = '', formatStyle = '') {
    const idLength = this.getDynamicLength()
    const randomPart = this.encodeBase62(crypto.randomBytes(12))
    const machinePart = this.getMachineSignature()
    const timePart = Date.now().toString(36)
    const rawBody = `${randomPart}${machinePart}${timePart}`.slice(0, idLength)
    const signature = crypto.createHmac('sha256', this.secretKey).update(rawBody).digest('hex').slice(0, 10).toLowerCase()
    const fullId = rawBody + signature
    const prefixedId = prefix ? `${prefix}-${fullId}` : fullId
    return this.format(prefixedId, formatStyle)
  }

  format(id, style = '') {
    if (!(id) || typeof id !== 'string') {
      return ''
    }
    const [prefixPart, ...idParts] = id.split('-')
    const joinedRaw = idParts.join('-') || prefixPart
    const plainId = joinedRaw.replace(/[^a-zA-Z0-9]/g, '')
    let formatted = ''
    if (style === 'dash') {
      formatted = plainId.replace(/(.{6})/g, '$1-').replace(/-$/, '')
    } else if (style === 'space') {
      formatted = plainId.replace(/(.{6})/g, '$1 ').trim()
    } else {
      return id
    }
    if (idParts.length > 0) {
      return `${prefixPart}-${formatted}`
    } else {
      return formatted
    }
  }

  verify(input) {
    if (!(input) || typeof input !== 'string') {
      return false
    }
    const segments = input.split('-')
    const rawId = segments.length > 1 ? segments.slice(1).join('') : input
    const cleaned = rawId.replace(/[^a-zA-Z0-9]/g, '')
    if (cleaned.length <= 10) {
      return false
    }
    const signature = cleaned.slice(-10).toLowerCase()
    const content = cleaned.slice(0, -10)
    const expected = crypto.createHmac('sha256', this.secretKey).update(content).digest('hex').slice(0, 10).toLowerCase()
    if (signature === expected) {
      return true
    } else {
      return false
    }
  }

  stressTest(total = 1e6, progressStep = 1e5) {
    const generated = new Set()
    const startedAt = Date.now()
    let duplicateCount = 0
    let invalidCount = 0
    for (let index = 1; index <= total; index++) {
      const id = this.generate()
      if (generated.has(id)) {
        duplicateCount++
      } else {
        generated.add(id)
      }
      if (!(this.verify(id))) {
        invalidCount++
      }
      if (index % progressStep === 0) {
        const timeElapsed = ((Date.now() - startedAt) / 1000).toFixed(2)
        const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
        console.log(`🧪 ${index.toLocaleString()} keys | Duplicates: ${duplicateCount} | Invalid: ${invalidCount} | Time: ${timeElapsed}s | RAM: ${memoryUsed} MB`)
      }
    }
    const totalTime = ((Date.now() - startedAt) / 1000).toFixed(2)
    console.log(`\n✅ Done: ${total.toLocaleString()} keys`)
    console.log(`⏱️  Total time: ${totalTime}s`)
    console.log(`🧬 Unique: ${generated.size.toLocaleString()}`)
    console.log(`⚠️  Duplicates: ${duplicateCount}`)
    console.log(`❌ Invalid: ${invalidCount}`)
  }
}

module.exports = ForgeID