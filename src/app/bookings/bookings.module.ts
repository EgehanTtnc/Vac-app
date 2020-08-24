import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';



import { BookingsPage } from './bookings.page';
import { BookingsPageRoutingModule } from './bookings-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookingsPageRoutingModule
  ],
  declarations: [BookingsPage]
})
export class BookingsPageModule {}
