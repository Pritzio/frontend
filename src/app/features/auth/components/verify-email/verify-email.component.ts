import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent implements OnInit {
  email: string = '';
  token: string = '';
  verificationStatus: 'pending' | 'success' | 'error' = 'pending';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 VerifyEmailComponent ngOnInit called');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Current route:', this.route.snapshot.url);
    
    this.route.queryParams.subscribe(params => {
      console.log('📋 Query params received:', params);
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      
      console.log('📧 Email:', this.email);
      console.log('🔑 Token:', this.token);
      
      if (this.token) {
        console.log('✅ Token found');
        this.verificationStatus = 'pending';
      } else {
        console.log('❌ No token found');
        this.verificationStatus = 'error';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}