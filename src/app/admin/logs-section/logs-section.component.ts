import { Component } from '@angular/core';
import { GenericEntitySection } from 'app/shared/generic-entity-section';
import { Log } from 'entities/log';

@Component({
  selector: 'app-logs-section',
  templateUrl: './logs-section.component.html',
  styleUrls: ['./logs-section.component.css']
})
export class LogsSectionComponent extends GenericEntitySection<Log> {
  
  /**
   * @constructor
   */
  constructor() {
    super({
      // Etats possibles (this.state) :
      List:     0 // Lister les projets
    });
  }

}
