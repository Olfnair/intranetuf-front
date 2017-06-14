import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Project } from "app/entities/project";
import { File as FileEntity } from "app/entities/file";
import { Version } from "app/entities/version";
import { User } from "app/entities/user";
import { Date } from "app/entities/date";
import { FileUploadService } from "app/shared/file-upload.service";

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.css']
})
export class AddFileComponent implements OnInit {
  private _form: FormGroup;
  private _uploadFile: File = undefined;
  private _paramsSub: Subscription;
  private _project: Project = new Project();
  private _file: FileEntity = new FileEntity();
  private _newVersionMode: boolean = false;

  constructor(private _uploadService: FileUploadService, private _router: Router, private _route: ActivatedRoute) {
    this._form = this._buildForm();
  }

  ngOnInit() {
    this._paramsSub = this._route.params.subscribe(params => {
      this._project.id = +params['projectId'] || undefined;
      this._file.id = +params['fileId'] || undefined;
      this._newVersionMode = (this._file.id != undefined);
    });
  }

  ngOnDestroy() {
    this._paramsSub.unsubscribe();
  }

  get form(): FormGroup {
    return this._form;
  }

  get filename() {
    return this._file && this._uploadFile.name || '';
  }

  fileSelect(file: File): void {
    this._uploadFile = file;
    this._form.controls.filename.setValue(this._uploadFile.name);
  }

  // on vérifie le form à la main : le champ 'filename' est désactivé pour qu'on ne puisse pas l'éditer,
  // malheureusement, un champ désactivé est considéré invalide par défaut... On doit donc vérifier les champs un par un
  // et faire un test particulier pour le cahmp 'filename'
  get isValidForm(): boolean {
    //TODO : ajouter un test pour chaque champ : this._form.controls.controlname.valid == true
    return this._form.controls.filename.value != '';
  }

  submit(): void {
    let version: Version = new Version();
    let author: User = new User();
    // l'auteur est géré par le backend
    // this._file.author = author;
    if(this._newVersionMode) {
      // TODO : nouvelle version
    }
    else {
      version.filename = this.filename;
      this._file.version = version;
      this._file.project = this._project;
      this._uploadService.upload([], this._uploadFile, this._file)
                       //.finally(() => console.log('sent'))
                       .subscribe(
                         //() => console.log('sent ok'), // marche pas ???
                         error => console.log(error)
                       )
    }
    this._router.navigate(['/home']);
  }

  cancel(): void {
    this._router.navigate(['/home']);
  }

  /**
     * Function to build our form
     *
     * @returns {FormGroup}
     *
     * @private
     */
  private _buildForm(): FormGroup {
    return new FormGroup({
      filename: new FormControl({value: '', disabled: true}, Validators.compose([
        Validators.required
      ]))
    });
  }

}
