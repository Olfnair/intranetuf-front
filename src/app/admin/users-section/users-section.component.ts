import { Component } from '@angular/core';
import { GenericEntitySection } from "../generic-admin-section";
import { User } from "entities/user";

@Component({
  selector: 'app-users-section',
  templateUrl: './users-section.component.html',
  styleUrls: ['./users-section.component.css']
})
export class UsersSectionComponent extends GenericEntitySection<User> {
  constructor() {
    super({
      List:   0,
      Add:    1,
      Edit:   2,
      Rights: 3,
      Roles:  4
    });
  }
}
