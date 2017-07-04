import { Component, OnInit, OnDestroy, Inject, NgZone } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { FileUploadService } from "app/shared/_services/file-upload.service";

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  private _progress: number = 0;
  private _sub: Subscription;

  constructor(
    @Inject(MD_DIALOG_DATA) private _obs: Observable<number>,
    private _uploadService: FileUploadService,
    private _zone: NgZone
  ) { }
  
 ngOnInit() {
    this._sub = this._obs.subscribe((value: number) => {
      this._zone.run(() => {
        this._progress = value;
      });
    });
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  get progress(): number {
    return this._progress;
  }

}
