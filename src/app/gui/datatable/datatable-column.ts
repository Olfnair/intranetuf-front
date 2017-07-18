export class DatatableColumn {
  public label: string = undefined
  public sort: boolean = undefined;
  public search: boolean = undefined;
  public width: number = undefined;

  constructor(label: string = undefined, sort: boolean = false, search: boolean = false, width: number = undefined) {
    this.label = label;
    this.sort = sort;
    this.search = search;
    this.width = width;
  }
}
