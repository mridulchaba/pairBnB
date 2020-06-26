import { Component, OnInit, OnDestroy } from "@angular/core";
import { BookingService } from "./booking.service";
import { Booking } from "./booking.model";
import { IonItemSliding, LoadingController } from "@ionic/angular";
import { Subscription } from "rxjs";

@Component({
  selector: "app-bookings",
  templateUrl: "./bookings.page.html",
  styleUrls: ["./bookings.page.scss"],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBooking: Booking[];
  private bookingSub: Subscription;
  constructor(
    private bookingService: BookingService,
    private loadCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.bookingSub = this.bookingService.bookings.subscribe((bookings) => {
      this.loadedBooking = bookings;
    });
    console.log(this.loadedBooking);
  }
  onCancelBooking(bookingId: string, slidingBooking: IonItemSliding) {
    slidingBooking.close();
    this.loadCtrl
      .create({ message: "Cancelling Booking.." })
      .then((loadingEl) => {
        loadingEl.present();
        this.bookingService.cancelBooking(bookingId).subscribe();
        loadingEl.dismiss();
      });
    // cancel booking
  }

  ngOnDestroy() {
    if (this.bookingSub) this.bookingSub.unsubscribe();
  }
}
