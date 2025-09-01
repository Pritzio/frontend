import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthService } from './core/services/auth.service';
import { TranslatePipe } from './shared/pipes/translate.pipe';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isAuthenticated = false;
  public currentUser: any = null;
  public isAdminRoute = false;
  public isUserDropdownOpen = false;

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
      }
    );
    
    this._authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
      }
    );

    // Detect if we are on an admin route
    this._router.events.subscribe(() => {
      this.isAdminRoute = this._router.url.startsWith('/admin');
    });

    // Cerrar dropdown cuando se hace click fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        this.isUserDropdownOpen = false;
      }
    });
  }

  public toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  public closeUserDropdown(): void {
    this.isUserDropdownOpen = false;
  }

  public logout(): void {
    this._authService.logout();
    this.isUserDropdownOpen = false;
  }

  public getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  public getUserRole(): string {
    if (!this.currentUser) return 'User';
    
    switch (this.currentUser.type) {
              case 'system': return 'Administrator';
              case 'business': return 'Business';
              case 'individual': return 'Individual';
        default: return 'User';
    }
  }
}
