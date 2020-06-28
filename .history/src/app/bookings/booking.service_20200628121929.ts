import { take, tap, delay, map } from "rxjs/operators";
import { AuthService } from "./../auth/auth.service";
import { Injectable } from "@angular/core";
import { Booking } from "./booking.model";
import { BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { switchMap } from "rxjs/operators";

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}
@Injectable({
  providedIn: "root",
})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([
    // {
    //   id: 'b1',
    //   placeId: 'p1',
    //   userId: 'abc',
    //   placeTitle: 'Manhattan Mansion',
    //   guestNumber: 2
    // }
  ]);
  get bookings() {
    return this._bookings.asObservable();
    // return [...this._bookings];
  }
  constructor(private authSer: AuthService, private http: HttpClient) {}

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImg: string,
    firstName: string,
    lastName: string,
    guestNo: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authSer.userId,
      placeTitle,
      placeImg,
      firstName,
      lastName,
      guestNo,
      dateFrom,
      dateTo
    );
    return this.http
      .post<{ name: string }>(
        "https://pairbnb-9ffd7.firebaseio.com/bookings.json",
        { ...newBooking, id: null }
      )
      .pipe(
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
    return this.http
      .delete(`https://pairbnb-9ffd7.firebaseio.com/bookings/${bookingId}.json`)
      .pipe(
        switchMap(() => {
          return this.bookings;
        }),
        tap((bookings) => {
          this._bookings.next(bookings.filter((b) => b.id !== bookingId));
        })
      );
    // return this.bookings.pipe(
    //   take(1),
    //   delay(1000),
    //   tap((bookings) => {
    //     this._bookings.next(bookings.filter((b) => b.id != bookingId));
    //   })
    // );
  }
  fetchBookings() {
    return this.http
      .get<{ [key: string]: BookingData }>(
        `https://pairbnb-9ffd7.firebaseio.com/bookings.json?orderBy="userId"&&equalTo="${this.authSer.userId}"`
      )
      .pipe(
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
