import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  text = '';
  
  constructor(private _router: Router) { }

  ngOnInit() {
  }

  coucou() {
    this.text = 'Bonjour !';
  }

  navigate(path: string) {
    this._router.navigate([path]);
  }

}
