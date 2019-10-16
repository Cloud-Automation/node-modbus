// export type ModbusResponse = Either<ModbusTCPResponse, ModbusRTUResponse>;
export class UserRequestMetrics {
  /**
   * Timestamp when the request was sent
   */
  public createdAt: Date = new Date()
  /**
   * Timestamp when the request was sent
   */
  public startedAt: Date = new Date()
  /**
   * Timestamp when the response was received
   */
  public receivedAt: Date = new Date()
  /**
   * Difference in the start and end date in milliseconds
   */
  public get transferTime (): number {
    return this.receivedAt.getTime() - this.startedAt.getTime()
  }
  /**
   * Amount of time in milliseconds the request was waiting in
   * the cue.
   */
  public get waitTime (): number {
    return this.startedAt.getTime() - this.createdAt.getTime()
  }
  public toJSON () {
    return {
      ...this,
      transferTime: this.transferTime
    }
  }
}
