import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { Plugins, Capacitor, AppState } from '@capacitor/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;

  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    // this.platform.is('hybrid');
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
  }

  ngOnInit() {
    this.authSub = this.authService.userIsAuthenticated.subscribe((isAuth) => {
      if (!isAuth || this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = isAuth;
    });
    Plugins.App.addListener("appStateChange", this.checkAuthOnResume.bind(this));
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }

}
