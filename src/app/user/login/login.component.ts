/**
 * Auteur : Florian
 * License : 
 */

import { Component, Inject, Optional, OnInit } from '@angular/core';
import { Response } from "@angular/http";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MD_DIALOG_DATA } from '@angular/material';
import { GuiForm } from "app/gui/gui-form";
import { Subscription } from "rxjs/Subscription";
import { SessionService } from "app/services/session.service";
import { ModalService } from 'app/gui/modal.service';

export class Options {
  constructor(
    public isModal: boolean = undefined
  ) { }
}

/**
 * Composant de login
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends GuiForm implements OnInit {
  /** le login a échoué ? */
  private _loginFail: boolean = false;
  /** message en cas d'échec de login */
  private _loginFailMessage: string = undefined;

  /**
   * @constructor
   * @param {SessionService} _session - données globales de session
   * @param {ModalService} _modal - service pour gérer les modales
   * @param {Options} _options - indique si le composant est une modale ou pas
   */
  constructor(
    private _session: SessionService,
    private _modal: ModalService,
    @Optional() @Inject(MD_DIALOG_DATA) private _options: Options = undefined
  ) {
    super();
  }

  /** Initialisation */
  ngOnInit(): void {
    if(this.isModal) {
      this.form.controls.login.patchValue(this._session.userLogin);
    }
  }

  /** @property {boolean} loginFail - indique si le login a échoué ou non */
  get loginFail(): boolean {
    return this._loginFail;
  }

  /** @property {strig} loginFailMessage - Message à afficher en cas d'échec de login */
  get loginFailMessage(): string {
    return this._loginFailMessage;
  }

  get isModal(): boolean {
    if(! this._options) {
      return false;
    }
    return this._options.isModal;
  }

  /**
   * Méthode qui choisit le message d'écehec de login en fonction de la réponse du serveur
   * @private
   * @param {Response} res - réponse du serveur suite à une tentative de login 
   */
  private loginFailure(res: Response): void {
    if(res.status == 401) {
      this._loginFailMessage = 'Identifiants invalides !';
    }
    else if(res.status == 0) {
      this._loginFailMessage = 'Problème de connexion au serveur...';
    }
    else {
      this._loginFailMessage = 'Une erreur indéterminée est survenue.';
    }
    this._loginFail = true;
    this.reset(); 
  }

  /**
   * Effectue les actions à effectuer lors d'un login réussi
   */
  private loginSuccess(): void {
    this._loginFail = false;
  }

  /**
   * Tente de se logger avec le login et le mot de passe fournis dans le formulaire
   */
  submit(): void {
    let login: string = this.form.value.login;
    let password: string = this.form.value.pwd;
    let sub: Subscription = this._session.login(this.form.value.login, this.form.value.pwd).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (success: Response) => {
        this.loginSuccess();
        if(this.isModal) {
          this._modal.close();
        }
      },
      (error: Response) => {
        this.loginFailure(error)
      }
    );
  }

  /**
   * Construit le formulaire de login
   * @protected
   * @override
   * @returns {FormGroup}
   */
  protected buildForm(): FormGroup {
    return new FormGroup({
      login: new FormControl('', Validators.compose([
        Validators.required
      ])),
      pwd: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }
}
