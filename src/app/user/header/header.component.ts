import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SessionService } from "services/session.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  private _displayListButton: boolean = false;

  private _toggleOnLarge$: EventEmitter<void> = new EventEmitter<void>();
  private _toggleOnSmall$: EventEmitter<void> = new EventEmitter<void>();

  constructor(private _session: SessionService) { }

  ngOnInit() {
  }

  @Output('toggleOnLarge') get toggleOnLarge$(): EventEmitter<void> {
    return this._toggleOnLarge$;
  }

  @Output('toggleOnSmall') get toggleOnSmall$(): EventEmitter<void> {
    return this._toggleOnSmall$;
  }

  @Input() set displayListButton(value: boolean) {
    this._displayListButton = value;
  }

  get displayListButton(): boolean {
    return this._displayListButton;
  }

  get logged(): boolean {
    return this._session.logged;
  }

  get admin(): boolean {
    return true;
  }

  get userLogin(): string {
    return this._session.userLogin;
  }

  disconnect(): void {
    this._session.logout();
  }

  toggleOnLarge(): void {
    this._toggleOnLarge$.emit();
  }

  toggleOnSmall(): void {
    this._toggleOnSmall$.emit();
  }

}
