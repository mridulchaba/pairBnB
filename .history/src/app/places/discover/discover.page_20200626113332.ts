import { AuthService } from "./../../auth/auth.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { PlacesService } from "../places.service";
import { Place } from "../place.model";
import { MenuController } from "@ionic/angular";
import { SegmentChangeEventDetail } from "@ionic/core";
import { Subscription } from "rxjs";
@Component({
  selector: "app-discover",
  templateUrl: "./discover.page.html",
  styleUrls: ["./discover.page.scss"],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  relevantPlaces: Place[];
  listedLoadedPlaces: Place[];
  private placesSub: Subscription;
  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController,
    private authSer: AuthService
  ) {}

  ngOnInit() {
    this.placesService.places.subscribe((places) => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }
  // onOpenMenu(){
  //   this.menuCtrl.toggle();
  // }
  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log(event.detail);
    if (event.detail.value === "all") {
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    } else {
      this.relevantPlaces = this.loadedPlaces.filter(
        (place) => place.userId != this.authSer.userId
      );
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    }
  }
  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
