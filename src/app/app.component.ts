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
  public isUserDropdownOpen = false;

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    console.log('AppComponent ngOnInit - Iniciando...');
    
    this._authService.isAuthenticated$.subscribe(
      isAuth => {
        console.log('AuthService isAuthenticated$:', isAuth);
        this.isAuthenticated = isAuth;
      }
    );
    
    this._authService.currentUser$.subscribe(
      user => {
        console.log('AuthService currentUser$:', user);
        this.currentUser = user;
      }
    );

    // Detectar si estamos en una ruta de admin
    this._router.events.subscribe(() => {
      this.isAdminRoute = this._router.url.startsWith('/admin');
      console.log('Router URL:', this._router.url, 'isAdminRoute:', this.isAdminRoute);
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
    console.log('toggleUserDropdown clicked, current state:', this.isUserDropdownOpen);
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  public closeUserDropdown(): void {
    this.isUserDropdownOpen = false;
  }

  public logout(): void {
    console.log('Logout clicked');
    this._authService.logout();
    this.isUserDropdownOpen = false;
  }

  public getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  public getUserRole(): string {
    if (!this.currentUser) return 'Usuario';
    
    switch (this.currentUser.type) {
      case 'system': return 'Administrador';
      case 'business': return 'Empresarial';
      case 'individual': return 'Individual';
      default: return 'Usuario';
    }
  }
}
