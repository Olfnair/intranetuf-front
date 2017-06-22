import { Component, OnInit, OnDestroy, Inject, NgZone } from '@angular/core';
import { FileUploadService } from "app/shared/file-upload.service";
import { Subscription } from "rxjs/Subscription";
import { MD_DIALOG_DATA } from '@angular/material';
import { Observable } from "rxjs/Observable";

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  private _progress: number = 0;
  private _sub: Subscription;

  constructor(@Inject(MD_DIALOG_DATA) private _obs: Observable<number>, private _uploadService: FileUploadService, private _zone: NgZone) { }
  
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
