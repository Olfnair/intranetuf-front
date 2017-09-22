import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'app/services/rest-api.service';
import { DatatableContentManager } from 'app/gui/datatable';
import { Log } from 'entities/log';

@Component({
  selector: 'app-loglist',
  templateUrl: './loglist.component.html',
  styleUrls: ['./loglist.component.css']
})
export class LoglistComponent extends DatatableContentManager<Log, RestApiService> implements OnInit {

  constructor(restService: RestApiService) {
    super(restService, 'fetchLogs', false);
  }

  ngOnInit() {
    this.load();
  }

}
