export class DatatableColumn {
  public label: string = undefined
  public sort: boolean = undefined;
  public search: boolean = undefined;
  public width: number = undefined;
  public query: string = undefined;

  constructor(
    label: string = undefined,
    sort: boolean = false,
    search: boolean = false,
    width: number = undefined,
    query: string = undefined
  ) {
    this.label = label;
    this.sort = sort;
    this.search = search;
    this.width = width;
    this.query = query;
  }
}
