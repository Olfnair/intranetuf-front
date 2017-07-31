import { MdDialogRef, MdDialog, ComponentType } from "@angular/material";
import { Injectable, TemplateRef } from '@angular/core';
import { GuiModalComponent, GuiModalData } from "app/gui/gui-modal";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

@Injectable()
export class ModalService {

  private _dialogRef: MdDialogRef<any> = undefined;

  constructor(private _dialog: MdDialog) { }

  popup(comp: ComponentType<any> | TemplateRef<any>, data: any = {}): Observable<any> {
    this._dialogRef = this._dialog.open(comp, {data: data});
    return Observable.create((observer: Observer<boolean>) => {
      let modalSub: Subscription = this._dialogRef.afterClosed().finally(() => {
        modalSub.unsubscribe();
        this._dialogRef = undefined;
      }).subscribe(
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
    return this.popup(GuiModalComponent, new GuiModalData(title, text, success));
  }

  yesno(title: string, text: string, success: boolean = true): Observable<boolean> {
    return this.popup(GuiModalComponent, new GuiModalData(title, text, success, true));
  }

  close(dialogResult?: any) {
    this._dialogRef.close(dialogResult);
  }

}
