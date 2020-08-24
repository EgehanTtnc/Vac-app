import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OffersPageRoutingModule } from './offers-routing.module';

import { OffersPage } from './offers.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { OfferItemComponent } from './offer-item/offer-item.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OffersPageRoutingModule,
    SharedModule
  ],
  declarations: [OffersPage, OfferItemComponent]
})
export class OffersPageModule {}
