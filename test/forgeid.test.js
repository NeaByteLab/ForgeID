const { expect } = require('chai')
const ForgeID = require('../src/forgeid')

describe('ForgeID', () => {
  const secret = 'unit-test-secret'
  const forge = new ForgeID(secret)

  it('should generate a valid raw ID', () => {
    const id = forge.generate()
    expect(id).to.be.a('string')
    expect(id.length).to.be.greaterThan(10)
    expect(forge.verify(id)).to.be.true
  })

  it('should generate and verify ID with prefix', () => {
    const id = forge.generate('TRX')
    expect(id.startsWith('TRX-')).to.be.true
    expect(forge.verify(id)).to.be.true
  })

  it('should generate and verify dash formatted ID', () => {
    const id = forge.generate('ORD', 'dash')
    expect(id).to.include('-')
    expect(forge.verify(id)).to.be.true
  })

  it('should generate and verify space formatted ID', () => {
    const id = forge.generate('REF', 'space')
    expect(id).to.include(' ')
    expect(forge.verify(id)).to.be.true
  })

  it('should reject a tampered ID', () => {
    const id = forge.generate()
    const modified = id.slice(0, -1) + 'x'
    expect(forge.verify(modified)).to.be.false
  })

  it('should return false for empty or invalid inputs', () => {
    expect(forge.verify()).to.be.false
    expect(forge.verify('')).to.be.false
    expect(forge.verify(null)).to.be.false
    expect(forge.verify(123)).to.be.false
  })

  it('should generate unique IDs (10K)', () => {
    const seen = new Set()
    for (let i = 0; i < 10000; i++) {
      const id = forge.generate()
      expect(seen.has(id)).to.be.false
      seen.add(id)
    }
  })
})