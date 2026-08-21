interface Props {
  id: string;
  title: string;
  authorName: string;
  publishedAt: Date;
  copies: number;
  available: boolean;
  acquisitionPrice: number;
}

export class Book {
  private readonly _id: string;
  private readonly _title: string;
  private readonly _authorName: string;
  private readonly _publishedAt: Date;
  private _copies: number;
  private _available: boolean;
  private readonly _acquisitionPrice: number;

  constructor(props: Props) {
    this._id = props.id;
    this._title = props.title;
    this._authorName = props.authorName;
    this._publishedAt = props.publishedAt;
    this._copies = props.copies;
    this._available = props.available;
    this._acquisitionPrice = props.acquisitionPrice;
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get authorName(): string {
    return this._authorName;
  }

  get publishedAt(): Date {
    return this._publishedAt;
  }

  get copies(): number {
    return this._copies;
  }

  get available(): boolean {
    return this._available;
  }

  /** Internal: never serialised into a response, never named from a URL. */
  get acquisitionPrice(): number {
    return this._acquisitionPrice;
  }

  lend(): void {
    this._copies = this._copies - 1;
    this._available = this._copies > 0;
  }
}
