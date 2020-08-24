import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MenuController } from '@ionic/angular';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  isLoading = false;
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[];
  private placesSub: Subscription;

  constructor(
    private placesService: PlacesService,
    private authService: AuthService,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe((places) => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authService.userId.pipe(take(1)).subscribe((userId) => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(
          (place) => place.userId !== userId
        );
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      }
    });
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
