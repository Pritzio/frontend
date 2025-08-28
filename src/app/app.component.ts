import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isAuthenticated = false;
  public currentUser: any = null;
  public isAdminRoute = false;

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );
    
    this._authService.currentUser$.subscribe(
      user => this.currentUser = user
    );

    // Detectar si estamos en una ruta de admin
    this._router.events.subscribe(() => {
      this.isAdminRoute = this._router.url.startsWith('/admin');
    });
  }

  public logout(): void {
    this._authService.logout();
  }

  public getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
