/**
 * Auteur : Florian
 * License :
 */
import { Component } from '@angular/core';
import { Pannel } from "app/user/pannel";
import { SessionService } from "app/services/session.service";

/**
 * Pannel du compte utilisateur
 */
@Component({
  selector: 'app-account-pannel',
  templateUrl: './account-pannel.component.html',
  styleUrls: ['./account-pannel.component.css']
})
export class AccountPannelComponent extends Pannel {

  /**
   * @constructor
   * @param {SessionService} session - données globales de session 
   */
  constructor(session: SessionService) {
    super('Account', session);
  }

}
