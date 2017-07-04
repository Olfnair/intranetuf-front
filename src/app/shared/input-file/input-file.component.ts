import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'input-file',
  templateUrl: './input-file.component.html',
  styleUrls: ['./input-file.component.css']
})
export class InputFileComponent {
  private _accept: string = '\'*/*\'';
  private _fileSelect$: EventEmitter<File> = new EventEmitter();

  @ViewChild('inputFile') nativeInputFile: ElementRef;

  private _files: File[];

  constructor() { }

  get fileCount(): number {
    return this._files && this._files.length || 0;
  }

  get file(): File {
    return this._files[0];
  }

  onNativeInputFileSelect(event): void {
    this._files = event.target.files;
    this._fileSelect$.emit(this._files[0]);
  }

  selectFile(): void {
    this.nativeInputFile.nativeElement.click();
  }

  get accept(): string {
    return this._accept;
  }

  @Input() set accept(accept: string) {
    this._accept = accept;
  }

  @Output('fileSelect') get fileSelect$(): EventEmitter<File> {
    return this._fileSelect$;
  }
}