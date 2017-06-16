import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { AddFileComponent } from "app/pages/add-file/add-file.component";
import { FileUploadService } from "app/shared/file-upload.service";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  private _progress: number = 0;
  private _sub: Subscription;

  constructor(private _uploadService: FileUploadService) { }

  ngOnInit() {
    this._sub = this._uploadService.progress$.subscribe((value: number) => {
      this._progress = value;
    });
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  get progress(): number {
    return this._progress;
  }

}
