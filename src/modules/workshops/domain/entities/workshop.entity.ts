export class Workshop {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly imageUrl: string,
    public readonly capacity: number,
    public readonly createdAt: Date,
  ) {}
}
