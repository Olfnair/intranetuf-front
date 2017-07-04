export class DatatableColumn {
  public label: string;
  public sortable: boolean;

  constructor(label: string = undefined, sortable: boolean = false) {
    this.label = label;
    this.sortable = sortable;
  }
}
