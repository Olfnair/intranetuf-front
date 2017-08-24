import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { RestApiService } from "app/services/rest-api.service";
import { GuiForm } from "app/gui/gui-form";
import { DatatableContentManager } from "app/gui/datatable";
import { User } from "entities/user";
import { RestLong } from "objects/rest-long";
import { EntityList } from "entities/entity-list";

class SelectedUsersDatatable extends DatatableContentManager<User, EntityList<User>> { 
  
  constructor(private _userList: EntityList<User>) {
    super(
      _userList,
      'select',
      false
    );
  }

  get userList(): EntityList<User> {
    return this._userList;
  }

}

class AvailableUsersDatatable extends DatatableContentManager<User, RestApiService> {

  private _selectedUsers: Map<number, User> = undefined;
  
  constructor(_restService: RestApiService, private _unavailableUsers: SelectedUsersDatatable) {
    super(
      _restService,
      'fetchUsersExcludeIds',
      false
    );
  }

  get selectedUsers(): Map<number, User> {
    return this._selectedUsers;
  }

  set selectedUsers(selectedUsers: Map<number, User>) {
    this._selectedUsers = selectedUsers;
  }

  /**
   * @override
   */
  load(): void {
    super.load([this._unavailableUsers.userList.ids]);
  }

  /**
   * Ajoute les utilisateurs sélectionnés
   */
  submit(): void {

  }
  
}

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent extends GuiForm {

  private _close$: EventEmitter<void> = new EventEmitter<void>();

  private _selectedControllers: SelectedUsersDatatable = new SelectedUsersDatatable(new EntityList<User>());
  private _selectedValidators: SelectedUsersDatatable = new SelectedUsersDatatable(new EntityList<User>());
  private _availableControllers: AvailableUsersDatatable;
  private _availableValidators: AvailableUsersDatatable;

  private _selectedUsers: SelectedUsersDatatable[] = [];
  private _availableUsers: AvailableUsersDatatable[] = [];

  private _selectUsersMode: boolean[] = [false, false];

  constructor(_restService: RestApiService) {
    super();
    this._availableControllers = new AvailableUsersDatatable(_restService, this._selectedControllers);
    this._availableValidators = new AvailableUsersDatatable(_restService, this._selectedValidators);
    this._selectedUsers.push(this._selectedControllers, this._selectedValidators);
    this._availableUsers.push(this._availableControllers, this._availableValidators);
    

    // TODO : enlever (pour test) :
    this._availableUsers[0].load();
  }

  @Output('close')
  get close$(): EventEmitter<void> {
    return this._close$;
  }

  get selectedUsers(): SelectedUsersDatatable[] {
    return this._selectedUsers;
  }

  get availableUsers(): AvailableUsersDatatable[] {
    return this._availableUsers;
  }

  get selectUsersMode(): boolean[] {
    return this._selectUsersMode;
  }

  isSelectUsersMode(index: number): boolean {
    return this._selectUsersMode[index];
  }

  switchMode(index: number): void {
    this._selectUsersMode[index] = ! this._selectUsersMode[index];
  }

  close(): void {
    this._close$.emit();
  }

  /**
   * Enregistre le nouveau projet
   */
  submit(): void {
    this.close();
  }

  /**
   * Construction du formulaire de choix du nom de projet
   * @protected
   * @override
   * @returns {FormGroup}
   */
  protected buildForm(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }

}
