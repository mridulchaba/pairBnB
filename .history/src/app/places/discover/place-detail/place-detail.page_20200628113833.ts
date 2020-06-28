import { AuthService } from "./../../../auth/auth.service";
import { BookingService } from "./../../../bookings/booking.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController,
} from "@ionic/angular";
import { PlacesService } from "../../places.service";
import { Place } from "../../place.model";
import { CreateBookingComponent } from "../../../bookings/create-booking/create-booking.component";
import { Subscription } from "rxjs";

@Component({
  selector: "app-place-detail",
  templateUrl: "./place-detail.page.html",
  styleUrls: ["./place-detail.page.scss"],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = true;
  isLoading = false;
  private placeSub: Subscription;
  constructor(
    private modalCtrl: ModalController,
    private placesService: PlacesService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private actionSheetCtrl: ActionSheetController,
    private bookingSer: BookingService,
    private loadCtrl: LoadingController,
    private authSer: AuthService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has("placeId")) {
        this.navCtrl.navigateBack("places/tabs/discover");
        return;
      }
      this.isLoading = true;
      this.placeSub = this.placesService
        .getPlace(paramMap.get("placeId"))
        .subscribe(
          (place) => {
            this.place = place;
            // this.isBookable = place.userId !== this.authSer.userId;
            this.isLoading = false;
          },
          (error) => {
            this.alertCtrl.create({
              header: "An error occured!",
              message: "Could not load place.",
              buttons: [
                {
                  text: "Okay",
                  handler: () => {
                    this.router.navigate(["/places/tabs/discover"]);
                  },
                },
              ],
            });
          }
        );
    });
  }
  onBookPlace() {
    // this.navCtrl.navigateBack('/places/tabs/discover');
    this.actionSheetCtrl
      .create({
        header: "Choose an action",
        buttons: [
          {
            text: "Select Date",
            handler: () => {
              this.openBookingModal("select");
            },
          },
          {
            text: "Random Data",
            handler: () => {
              this.openBookingModal("random");
            },
          },
          {
            text: "Cancel",
            role: "destructive",
          },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }
  openBookingModal(mode: "select" | "random") {
    console.log(mode);
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, selectedMode: mode },
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((resultData) => {
        console.log(resultData.data, resultData.role);
        if (resultData.role === "confirm") {
          this.loadCtrl
            .create({
              message: "Booking place..",
            })
            .then((loadingEl) => {
              loadingEl.present();
              const data = resultData.data.bookingData;
              this.bookingSer
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.guestNumber,
                  data.startDate,
                  data.endDate
                )
                .subscribe(() => {
                  loadingEl.dismiss();
                });
              console.log("BOOKED!");
            });
        }
      });
  }
  ngOnDestroy() {
    if (this.placeSub) this.placeSub.unsubscribe();
  }
}
