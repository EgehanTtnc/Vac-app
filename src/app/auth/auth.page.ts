import { Component, OnInit } from '@angular/core';
import { AuthService, AuthResponseData } from './auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Giriş Yapılıyor...' })
      .then((loadingEl) => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        if(this.isLogin) {
          authObs = this.authService.login(email, password);
        }else {
          authObs = this.authService.signup(email, password);
        }
        authObs.subscribe(
          (resData) => {
            console.log(resData);
            this.isLoading = false;
            loadingEl.dismiss();
            this.router.navigateByUrl('/places/discover');
          },
          (errRes) => {
            loadingEl.dismiss();
            const code = errRes.error.error.message;
            let message = 'Kayıt yapılamadı, lütfen tekrar deneyin.';
            if (code === 'EMAIL_EXISTS') {
              message = 'Email adresi zaten kayıtlı.';
              this.showAlert(message);
            } else if ( code === 'EMAIL_NOT_FOUND') {
              message = 'E-Mail Bulunamadı, lütfen önce kayıt olun.';
            } else if ( code === 'INVALID_PASSWORD') {
              message = 'Şifre yanlış. lütfen tekrar deneyin.';
            }
          }
        );
      });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    this.authenticate(email, password);
    form.reset();
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Sorgulama yapılamadı',
        message: message,
        buttons: ['Tamam'],
      })
      .then((alertEl) => {
        alertEl.present();
      });
  }
}
