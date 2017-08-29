import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { RestApiService } from "app/services/rest-api.service";
import { GuiForm } from "app/gui/gui-form";
import { DatatableContentManager, DatatableQueryParams } from "app/gui/datatable";
import { User } from "entities/user";
import { RestLong } from "objects/rest-long";
import { EntityList } from "entities/entity-list";
import { Subscription } from "rxjs/Subscription";
import { Project } from "entities/project";
import { ProjectRight, Right } from "entities/project-right";

class SelectedUsersDatatable extends DatatableContentManager<User, EntityList<User>> {
  
  constructor(private _userList: EntityList<User>, private _title: string = '') {
    super(
      _userList,
      'select',
      false
    );
  }

  get title(): string {
    return this._title;
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
      false,
      () => {
        this.reload = false;
      }
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
  save(): void {
    this._selectedUsers.forEach((user: User) => {
      this._unavailableUsers.userList.add(user);
    });
  }
  
}

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent extends GuiForm implements OnInit {

  private _close$: EventEmitter<void> = new EventEmitter<void>();

  private _selectedControllers: SelectedUsersDatatable =
      new SelectedUsersDatatable(new EntityList<User>(), 'Contrôleurs');
  private _selectedValidators: SelectedUsersDatatable =
      new SelectedUsersDatatable(new EntityList<User>(), 'Valideurs');
  private _availableControllers: AvailableUsersDatatable;
  private _availableValidators: AvailableUsersDatatable;

  private _selectedUsers: SelectedUsersDatatable[] = [];
  private _availableUsers: AvailableUsersDatatable[] = [];

  private _selectUsersMode: boolean[] = [false, false];

  constructor(private _restService: RestApiService) {
    super();
    this._availableControllers = new AvailableUsersDatatable(_restService, this._selectedControllers);
    this._availableValidators = new AvailableUsersDatatable(_restService, this._selectedValidators);
    this._selectedUsers.push(this._selectedControllers, this._selectedValidators);
    this._availableUsers.push(this._availableControllers, this._availableValidators);
  }

  ngOnInit(): void {
    this._selectedUsers.forEach((selectedTable: SelectedUsersDatatable) => {
      selectedTable.load();
    });
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

  addUsersTo(index: number): void {
    this.switchMode(index);
    this._availableUsers[index].reload = true;
    this._availableUsers[index].load();
  }

  removeUserFrom(user: User, index: number): void {
    this._selectedUsers[index].userList.remove(user.id);
    this._selectedUsers[index].load();
  }

  switchMode(index: number): void {
    this._selectUsersMode[index] = ! this._selectUsersMode[index];
  }

  save(index: number): void {
    this._availableUsers[index].save();
    this.switchMode(index);
  }

  close(): void {
    this._close$.emit();
  }

  private convertSelectedUsersToRights(
    rightsMap: Map<number, ProjectRight>,
    index: number,
    rightToAdd: Right,
    project: Project
  ): void {
    this.selectedUsers[index].userList.listMap.forEach((user: User) => {
      let right: ProjectRight;
      if(rightsMap.has(user.id)) {
        right = rightsMap.get(user.id);
      }
      else {
        right = new ProjectRight();
      }
      right.rights |= rightToAdd;
      right.user = user;
      right.project = project;
      rightsMap.set(user.id, right);
    });
  }

  /**
   * Enregistre le nouveau projet
   */
  submit(): void {
    let sub: Subscription = this._restService.createProject(this.form.controls.name.value).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (project: Project) => {
        let rightsMap: Map<number, ProjectRight> = new Map<number, ProjectRight>();
        this.convertSelectedUsersToRights(rightsMap, 0, Right.CONTROLFILE, project);
        this.convertSelectedUsersToRights(rightsMap, 1, Right.VALIDATEFILE, project);
        let rightsTab: ProjectRight[] = [];
        rightsMap.forEach((right: ProjectRight) => {
          rightsTab.push(right);
        });
        let sub: Subscription = this._restService.createOrEditRightsForProject(project.id, rightsTab).finally(() => {
          sub.unsubscribe(); 
        }).subscribe(
          (status: number) => {
            // OK
            this.close();
          },
          (error: Response) => {
            // TODO : afficher message d'erreur
          }
        );
      },
      (error: Response) => {
        // TODO : message d'erreur
      }
    )
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
