import { Injectable } from '@angular/core';

import { Booking } from './booking.model';
import { Place } from '../places/place.model';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { auth } from 'firebase';

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  guestNumber: number;
  firstName: string;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) {}

  get bookings() {
    return this._bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    let fetchedUserId: string;
    let newBooking: Booking;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error('No user id found!');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {
        newBooking = new Booking(
          Math.random().toString(),
          placeId,
          fetchedUserId,
          placeTitle,
          placeImage,
          firstName,
          lastName,
          guestNumber,
          dateFrom,
          dateTo
        );
        return this.http.post<{ name: string }>(
          `https://ionic-demo-app-b08a0.firebaseio.com/bookings.json?auth=${token}`,
          { ...newBooking, id: null }
        );
      }),
      switchMap((resData) => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap((bookings) => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  cancelBooking(bookingId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.delete(
          `https://ionic-demo-app-b08a0.firebaseio.com/bookings/${bookingId}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.bookings;
      }),
      take(1),
      tap((bookings) => {
        this._bookings.next(bookings.filter((b) => b.id !== bookingId));
      })
    );
  }

  fetchBookings() {
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error('User not found.');
        }
        fetchedUserId = userId;
        return this.authService.token.pipe(
          take(1),
          switchMap((token) => {
            return this.http.get<{ [key: string]: BookingData }>(
              `https://ionic-demo-app-b08a0.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`
            );
          })
        );
      }),
      map((bookingData) => {
        const bookings = [];
        for (const key in bookingData) {
          if (bookingData.hasOwnProperty(key)) {
            bookings.push(
              new Booking(
                key,
                bookingData[key].placeId,
                bookingData[key].userId,
                bookingData[key].placeTitle,
                bookingData[key].placeImage,
                bookingData[key].firstName,
                bookingData[key].lastName,
                bookingData[key].guestNumber,
                new Date(bookingData[key].bookedFrom),
                new Date(bookingData[key].bookedTo)
              )
            );
          }
        }
        return bookings;
      }),
      tap((bookings) => {
        this._bookings.next(bookings);
      })
    );
  }
}
