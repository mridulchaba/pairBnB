import { AuthService } from "./../auth/auth.service";
import { Injectable } from "@angular/core";
import { Place } from "./place.model";
import { BehaviorSubject } from "rxjs";
import { take, map, tap, delay } from "rxjs/operators";
@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      "p1",
      "Taj Mahal",
      "Agra vala mahal",
      "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg",
      10000000,
      new Date("2020-06-28"),
      new Date("2020-07-09"),
      "xyz"
    ),
    new Place(
      "p2",
      "Sikri Fort",
      "Sikri vala mahal",
      "https://www.tutorialspoint.com/fatehpur_sikri_fort/images/fateh.jpg",
      500000,
      new Date("2020-06-28"),
      new Date("2020-07-09"),
      "abc"
    ),
    new Place(
      "p3",
      "Jama Masjid",
      "Jama vala Masjid",
      "https://upload.wikimedia.org/wikipedia/commons/a/a4/Jama_Masjid_-_In_the_Noon.jpg",
      9000000,
      new Date("2020-06-28"),
      new Date("2020-07-09"),
      "abc"
    ),
  ]);

  get places() {
    return this._places.asObservable();
  }
  constructor(private authSer: AuthService) {}
  getPlace(id: string) {
    return this.places.pipe(
      take(1),
      map((places) => {
        return { ...places.find((p) => p.id === id) };
      })
    );
  }
  addPlace(
    title: string,
    desc: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      desc,
      "https://upload.wikimedia.org/wikipedia/commons/2/2f/Gujari_mahal_-_panoramio.jpg",
      price,
      dateFrom,
      dateTo,
      this.authSer.userId
    );
    // this._places.push(newPlace);
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, desc: string) {
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          desc,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        this._places.next(updatedPlaces);
      })
    );
  }
}
