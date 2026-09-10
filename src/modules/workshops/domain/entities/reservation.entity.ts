export class Reservation {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly workshopId: string,
    public readonly createdAt: Date,
  ) {}
}
