const { expect } = require('chai')
const ForgeID = require('../src/forgeid')

describe('ForgeID Generator', () => {
  const secret = 'unit-test-secret'
  const forge = new ForgeID(secret)

  it('should generate a valid ID', () => {
    const id = forge.generate()
    expect(id).to.be.a('string')
    expect(id.length).to.be.greaterThan(10)
  })

  it('should verify a valid ID correctly', () => {
    const id = forge.generate()
    const valid = forge.verify(id)
    expect(valid).to.be.true
  })

  it('should reject a tampered ID', () => {
    const id = forge.generate()
    const broken = id.slice(0, -1) + 'x'
    const valid = forge.verify(broken)
    expect(valid).to.be.false
  })

  it('should return false for empty or invalid input', () => {
    expect(forge.verify()).to.be.false
    expect(forge.verify('')).to.be.false
    expect(forge.verify(12345)).to.be.false
  })

  it('should generate unique IDs (no duplicates in 10000)', () => {
    const set = new Set()
    for (let i = 0; i < 10000; i++) {
      const id = forge.generate()
      expect(set.has(id)).to.be.false
      set.add(id)
    }
  })
})