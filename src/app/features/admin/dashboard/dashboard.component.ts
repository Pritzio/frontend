import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { IUser } from '../../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public currentUser: IUser | null = null;
  public dashboardStats = {
    totalUsers: 0,
    totalStores: 0,
    totalProducts: 0,
    activeScraping: 0
  };

  constructor(private _authService: AuthService) {}

  ngOnInit(): void {
    this._loadUserData();
    this._loadDashboardStats();
  }

  private _loadUserData(): void {
    this._authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private _loadDashboardStats(): void {
    // TODO: Implement API calls to get dashboard statistics
    this.dashboardStats = {
      totalUsers: 1250,
      totalStores: 89,
      totalProducts: 15420,
      activeScraping: 3
    };
  }

  logout(): void {
    this._authService.logout();
  }
}
