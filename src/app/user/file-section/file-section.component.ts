import { Component, Input } from '@angular/core';
import { SessionService } from "app/services/session.service";
import { AppSection } from "app/shared/app-section";
import { File } from "entities/file";
import { Project } from "entities/project";
import { Version } from "entities/version";
import { WorkflowCheck } from "entities/workflow-check";

@Component({
  selector: 'app-file-section',
  templateUrl: './file-section.component.html',
  styleUrls: ['./file-section.component.css']
})
export class FileSectionComponent extends AppSection {
  private _project: Project = undefined;
  private _file: File = undefined;
  private _version: Version = undefined;
  private _check: WorkflowCheck = undefined;

  private _ignoreSessionProject: boolean = false;

  constructor(private _session: SessionService) {
    super({
      Filelist:       0,
      AddFile:        1,
      VersionDetails: 2,
      CheckVersion:   3
    });
  }

  @Input() set ignoreSessionProject(ignoreSessionProject: boolean) {
    this._ignoreSessionProject = ignoreSessionProject;
  }

  stateToActivate(): number {
    if(! this._ignoreSessionProject && this._project != this.selectedProject) {
      this.state = this.State.Filelist;
      this._project = this.selectedProject;
    }
    return this.state;
  }

  get project(): Project {
    return this._project;
  }

  @Input() set project(project: Project) {
    this._project = project;
  }

  get file(): File {
    return this._file;
  }

  set file(file: File) {
    this._file = file;
  }

  get version(): Version {
    return this._version;
  }

  set version(version: Version) {
    this._version = version;
  }

  get check(): WorkflowCheck {
    return this._check;
  }

  set check(check: WorkflowCheck) {
    this._check = check;
  }

  get selectedProject(): Project {
    return this._session.selectedProject;
  }

  get readyForContent(): boolean {
    return this._session.readyForContent;
  }

  setStateAndFile(state: number, file: File) {
    this.state = state;
    this._file = file;
  }
}
