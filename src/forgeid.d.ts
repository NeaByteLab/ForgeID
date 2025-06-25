declare module 'forgeid' {
  class ForgeID {
    constructor(
      secretKey?: string,
      startYear?: number,
      baseLength?: number,
      intervalYears?: number
    )
    generate(prefix?: string, formatStyle?: 'dash' | 'space' | ''): string
    verify(code: string): boolean
    format(id: string, style?: 'dash' | 'space' | ''): string
    stressTest(total?: number, progressStep?: number): void
  }
  export = ForgeID
}