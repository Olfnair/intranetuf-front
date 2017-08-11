/**
 * Auteur : Florian
 * License : 
 */

import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';

/**
 * Composant qui permet de choisir un fichier
 */
@Component({
  moduleId: module.id,
  selector: 'input-file',
  templateUrl: './input-file.component.html',
  styleUrls: ['./input-file.component.css']
})
export class InputFileComponent {
  
  /** fichiers acceptés */
  private _accept: string = '\'*/*\'';
  
  /** @event - un fichier a été sélectionné */
  private _fileSelect$: EventEmitter<File> = new EventEmitter();

  /** Composant natif de sélection de fichier */
  @ViewChild('inputFile')
  nativeInputFile: ElementRef;

  /** fichiers sélectionnés */
  private _files: File[];

  /** @constructor */
  constructor() { }

  /** @property {number} fileCount - nombre de fichiers sélectionnés */
  get fileCount(): number {
    return this._files && this._files.length || 0;
  }

  /** @property {File} file - premier fichier sélectionné */
  get file(): File {
    return this._files[0];
  }

  /**
   * Méthode appelée lorsqu'on choisi des fichiers dans le composant natif
   * @param event - évènement de sélection des fichiers du composant natif
   * @emits fileSelect - évènement de sélection d'un fichier
   */
  onNativeInputFileSelect(event): void {
    this._files = event.target.files;
    this._fileSelect$.emit(this._files[0]); // émet le premier fichier sélectionné
  }

  /**
   * Simule un click sur le composant natif
   */
  selectFile(): void {
    this.nativeInputFile.nativeElement.click();
  }

  /** @property {string} accept - fichiers acceptés par le composant */
  get accept(): string {
    return this._accept;
  }

  @Input() set accept(accept: string) {
    this._accept = accept;
  }

  /**
   * @event fileSelect - un fichier a été sélectionné
   * @returns {EventEmitter<File>} - le fichier sélectionné
   */
  @Output('fileSelect')
  get fileSelect$(): EventEmitter<File> {
    return this._fileSelect$;
  }
  
}