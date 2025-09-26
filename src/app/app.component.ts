import { Component, OnInit, HostListener } from '@angular/core';
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
  public isMobileMenuOpen = false;
  public isMobileView = false;

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._checkMobileView();
    
    this._authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        if (isAuth && this._isAdminUser() && this.isMobileView && this._router.url === '/admin') {
          // Redirect admin users away from admin panel on mobile
          this._router.navigate(['/dashboard']);
        }
      }
    );
    
    this._authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
        if (user && this._isAdminUser() && this.isMobileView && this._router.url === '/admin') {
          // Redirect admin users away from admin panel on mobile
          this._router.navigate(['/dashboard']);
        }
      }
    );

    // Detect if we are on an admin route
    this._router.events.subscribe(() => {
      this.isAdminRoute = this._router.url.startsWith('/admin');
      // Redirect admin users away from admin panel on mobile
      if (this.isAdminRoute && this.isMobileView && this._isAdminUser()) {
        this._router.navigate(['/dashboard']);
      }
    });

    // Cerrar dropdown cuando se hace click fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        this.isUserDropdownOpen = false;
      }
      if (!target.closest('.mobile-menu-toggle') && !target.closest('.mobile-nav')) {
        this.isMobileMenuOpen = false;
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this._checkMobileView();
  }

  private _checkMobileView(): void {
    this.isMobileView = window.innerWidth < 1024; // lg breakpoint
  }

  public _isAdminUser(): boolean {
    return this.currentUser?.type === 'system';
  }

  public toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  public closeUserDropdown(): void {
    this.isUserDropdownOpen = false;
  }

  public toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  public closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  public logout(): void {
    this._authService.logout();
    this.isUserDropdownOpen = false;
    this.isMobileMenuOpen = false;
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
