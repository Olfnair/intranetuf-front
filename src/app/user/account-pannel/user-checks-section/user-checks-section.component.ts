import { Component, OnInit, Input } from '@angular/core';
import { GenericEntitySection } from "app/shared/generic-entity-section";
import { Entity } from "entities/entity";
import { RestApiService } from "app/services/rest-api.service";
import { File } from "entities/file";
import { Version } from "entities/version";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'app-user-checks-section',
  templateUrl: './user-checks-section.component.html',
  styleUrls: ['./user-checks-section.component.css']
})
export class UserChecksSectionComponent extends GenericEntitySection<Entity> {

  private _title: string = '';
  private _whereParams: [string, string][] = [];

  /**
   * @constructor
   */
  constructor(private _restService: RestApiService) {
    super({
      List:           0,  // liste
      Check:          1,  // effectuer check
      VersionDetails: 2   // detail de version
    });
  }

  get title(): string {
    return this._title;
  }

  @Input()
  set title(title: string) {
    this._title = title;
  }

  get whereParams(): [string, string][] {
    return this._whereParams
  }

  @Input()
  set whereParams(whereParams) {
    this._whereParams = whereParams;
  }

  viewDetails(version: Version): void {
    let sub : Subscription = this._restService.fetchFileByVersion(version.id).finally(() => {
      sub.unsubscribe
    }).subscribe(
      (file: File) => {
        this.setStateAndEntity(this.State.VersionDetails, file);
      },
      (error: Response) => {
        // TODO : gérer une eventuelle erreur du backend
      }
    );
  }

}
