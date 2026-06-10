import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { LoginRequest } from '../../common/models/auth.model';
import { AuthService } from '@services/auth.service';
import { Settings, SettingsService } from '@services/settings.service';
import { TranslationService } from '@services/translation.service';
import { emailValidator } from '../../theme/utils/app-validators';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-login',
    imports: [
        RouterModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatSidenavModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatTooltipModule,
        TranslatePipe
    ],
    templateUrl: './login.component.html'
})
export class LoginComponent {
  public form: FormGroup;
  public settings: Settings;
  public isSubmitting = false;
  public loginError: string | null = null;

  constructor(public settingsService: SettingsService,
              public fb: FormBuilder,
              public router: Router,
              private authService: AuthService,
              private snackBar: MatSnackBar,
              private translationService: TranslationService){
    this.settings = this.settingsService.settings; 
    this.form = this.fb.group({
      'email': [null, Validators.compose([Validators.required, emailValidator])],
      'password': [null, Validators.compose([Validators.required, Validators.minLength(8)])]
    });
  }

  public onSubmit(values: LoginRequest): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.loginError = null;

    const payload: LoginRequest = {
      email: values.email,
      password: values.password
    };

    this.authService.login(payload).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error: HttpErrorResponse) => {
        this.loginError = this.resolveLoginError(error);
        this.showMessage(this.loginError);
      }
    });
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.settings.loadingSpinner = false; 
    });  
  }

  private resolveLoginError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return this.translationService.translate('auth.couldNotConnect');
    }

    if (error.status === 401) {
      return this.translationService.translate('auth.invalidCredentials');
    }

    if (error.status === 400) {
      return this.translationService.translate('auth.checkData');
    }

    if (error.status === 429) {
      return this.translationService.translate('auth.tooManyAttempts');
    }

    return this.translationService.translate('auth.couldNotSignIn');
  }

  private showMessage(message: string): void {
    this.snackBar.open(
      message,
      this.translationService.translate('action.close'),
      { duration: 3000 }
    );
  }
}
