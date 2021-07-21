import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../shared/authentication-service';
import { RegistrationPage } from '../registration/registration.page';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
})
export class VerifyEmailPage implements OnInit {
  constructor(
    public authService: AuthenticationService,
    public registrationPg: RegistrationPage
  ) {}

  ngOnInit() {}
}
