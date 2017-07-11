import { MdDialogRef, MdDialog, ComponentType } from "@angular/material";
import { TemplateRef } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs/Subscription";
import { GuiModalComponent } from "app/gui/gui-modal";

export class GuiModal {

  private _dialogRef: MdDialogRef<GuiModalComponent> = undefined;

  constructor(private _dialog: MdDialog) { }

  popup(comp: ComponentType<any> | TemplateRef<any>, data: any): Observable<any> {
    this._dialogRef = this._dialog.open(comp, {data: data});
    return Observable.create((observer: Observer<boolean>) => {
      let modalSub: Subscription = this._dialogRef.afterClosed()
      .finally(() => {
        modalSub.unsubscribe();
        this._dialogRef = undefined;
      })
      .subscribe(
        (data: any) => {
          observer.next(data);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }
   
  info(title: string, text: string, success: boolean = false): Observable<boolean> {
    return this.popup(GuiModalComponent, {title: title, text: text, success: success});
  }
}