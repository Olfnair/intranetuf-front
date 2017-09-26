import { Component, Input } from '@angular/core';
import { ModalService } from 'app/gui/modal.service';
import { LoginComponent } from 'app/user/login/login.component';

@Component({
  selector: 'app-token-updater',
  templateUrl: './token-updater.component.html',
  styleUrls: ['./token-updater.component.css']
})
export class TokenUpdaterComponent {

  constructor(private _modal: ModalService) { }

  @Input()
  set updateToken(updateToken: boolean) {
    if(updateToken) {
      setTimeout(() => {
        this._modal.popup(LoginComponent, {isModal: true}, {disableClose: true});
      }, 0);
    }
  }
}
