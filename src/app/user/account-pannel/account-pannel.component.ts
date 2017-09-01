/**
 * Auteur : Florian
 * License :
 */
import { Component, OnInit } from '@angular/core';
import { Pannel } from "app/user/pannel";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { User } from "entities/user";

/**
 * Pannel du compte utilisateur
 */
@Component({
  selector: 'app-account-pannel',
  templateUrl: './account-pannel.component.html',
  styleUrls: ['./account-pannel.component.css']
})
export class AccountPannelComponent extends Pannel implements OnInit {
  
  /** utilisateur courant (celui qui est connecté) */
  private _currentUser: User;

  /**
   * @constructor
   * @param {RestApiService} _restService - service REST utilisé
   * @param {SessionService} _sess - données globales de session 
   */
  constructor(private _restService: RestApiService, private _sess: SessionService) {
    super('Account', _sess);
  }

  /** Initialisation : charge l'utilisateur courant */
  ngOnInit(): void {
    let sub: Subscription = this._restService.fetchUser(this._sess.userId).finally(() => {
      sub.unsubscribe();
    }).subscribe((user: User) => {
      this._currentUser = user;
    });
  }

  /** @property {User} currentUser - utilisateur courant (celui qui est connecté) */
  get currentUser(): User {
    return this._currentUser;
  }

}
