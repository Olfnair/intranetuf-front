export class GuiModalData {

  public title: string = '';
  public text: string = '';
  public success: boolean = false;
  public yesno: boolean = false;

  constructor(
    title: string = '',
    text: string = '',
    success: boolean = false,
    yesno: boolean = false
  ) {
    this.title = title;
    this.text =text;
    this.success = success;
    this.yesno = yesno;
  }
  
}