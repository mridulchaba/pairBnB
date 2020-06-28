import { Validators } from "@angular/forms";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { PlacesService } from "../../places.service";
import { NavController, LoadingController } from "@ionic/angular";
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
  form: FormGroup;
  private placeSub: Subscription;
  constructor(
    private placesService: PlacesService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private loadCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has("placeId")) {
        this.navCtrl.navigateBack("places/tabs/offers");
        return;
      }
      this.placeSub = this.placesService
        .getPlace(paramMap.get("placeId"))
        .subscribe((place) => {
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
        });
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
