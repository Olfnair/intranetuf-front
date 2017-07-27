import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {

  constructor(private _router: Router) { }

  ngOnInit(): void {
    // retour à l'accueil
    this._router.navigate(['/']);
  }
  
}
