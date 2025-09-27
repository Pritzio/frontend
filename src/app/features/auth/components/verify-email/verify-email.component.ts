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
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      
      if (this.token) {
        this.verificationStatus = 'pending';
      } else {
        this.verificationStatus = 'error';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}