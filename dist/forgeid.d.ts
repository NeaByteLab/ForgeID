declare module 'forgeid' {
  export interface ForgeIDOptions {
    secret?: string
    startYear?: number
    baseLength?: number
    intervalYears?: number
  }

  export class ForgeID {
    constructor(
      secret?: string,
      startYear?: number,
      baseLength?: number,
      intervalYears?: number
    )

    generate(): string
    verify(id: string): boolean
    stressTest(count?: number, step?: number): void
  }

  export default ForgeID
}