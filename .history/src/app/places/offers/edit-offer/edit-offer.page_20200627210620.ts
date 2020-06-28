import { Validators } from "@angular/forms";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { PlacesService } from "../../places.service";
import {
  NavController,
  LoadingController,
  AlertController,
} from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { Place } from "../../place.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-edit-offer",
  templateUrl: "./edit-offer.page.html",
  styleUrls: ["./edit-offer.page.scss"],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  placeId: string;
  form: FormGroup;
  isLoading = false;
  private placeSub: Subscription;
  constructor(
    private placesService: PlacesService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private loadCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has("placeId")) {
        this.navCtrl.navigateBack("places/tabs/offers");
        return;
      }
      this.placeId = paramMap.get("placeId");
      this.isLoading = true;
      // console.log(this.placeId);
      this.placeSub = this.placesService
        .getPlace(paramMap.get("placeId"))
        .subscribe(
          (place) => {
            // console.log("subscribing");
            this.place = place;
            this.form = new FormGroup({
              title: new FormControl(this.place.title, {
                updateOn: "blur",
                validators: [Validators.required],
              }),
              description: new FormControl(this.place.description, {
                updateOn: "blur",
                validators: [Validators.required, Validators.maxLength(180)],
              }),
            });
            // console.log("pohoho");
            this.isLoading = false;
          },
          (error) => {
            this.alertCtrl
              .create({
                header: "An error occured",
                message: "Place could not be fetched, Please try again later",
                buttons: [
                  {
                    text: "Okay",
                    handler: () => {
                      this.router.navigate(["/places/tabs/offers"]);
                    },
                  },
                ],
              })
              .then((alertEl) => {
                alertEl.present();
              });
          }
        );
    });
  }
  onUpdateOffer() {
    if (!this.form.valid) return;
    this.loadCtrl
      .create({
        message: "Updating place../",
      })
      .then((loadingEl) => {
        loadingEl.present();
        console.log(this.form);
        this.placesService
          .updatePlace(
            this.place.id,
            this.form.value.title,
            this.form.value.description
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(["/places/tabs/offers"]);
          });
      });
  }
  ngOnDestroy() {
    if (this.placeSub) this.placeSub.unsubscribe();
  }
}
