import { AuthService } from "./../auth/auth.service";
import { Injectable } from "@angular/core";
import { Place } from "./place.model";
import { BehaviorSubject } from "rxjs";
import { take, map, tap, delay, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}
@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    // new Place(
    //   "p1",
    //   "Taj Mahal",
    //   "Agra vala mahal",
    //   "https://upload.wikimedia.org/wikipedia/commons/1/1d/Taj_Mahal_%28Edited%29.jpeg",
    //   10000000,
    //   new Date("2020-06-28"),
    //   new Date("2020-07-09"),
    //   "xyz"
    // ),
    // new Place(
    //   "p2",
    //   "Sikri Fort",
    //   "Sikri vala mahal",
    //   "https://www.tutorialspoint.com/fatehpur_sikri_fort/images/fateh.jpg",
    //   500000,
    //   new Date("2020-06-28"),
    //   new Date("2020-07-09"),
    //   "abc"
    // ),
    // new Place(
    //   "p3",
    //   "Jama Masjid",
    //   "Jama vala Masjid",
    //   "https://upload.wikimedia.org/wikipedia/commons/a/a4/Jama_Masjid_-_In_the_Noon.jpg",
    //   9000000,
    //   new Date("2020-06-28"),
    //   new Date("2020-07-09"),
    //   "abc"
    // ),
  ]);

  get places() {
    return this._places.asObservable();
  }
  constructor(private authSer: AuthService, private http: HttpClient) {}

  fetchPlaces() {
    return this.http
      .get<{ [key: string]: PlaceData }>(
        "https://pairbnb-9ffd7.firebaseio.com/offered-places.json"
      )
      .pipe(
        map((resData) => {
          const places = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].availableFrom),
                  new Date(resData[key].availableTo),
                  resData[key].userId
                )
              );
            }
          }
          // return [];
          return places;
        }),
        tap((places) => {
          this._places.next(places);
        })
      );
  }
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
    let generatedId: string;
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
    return this.http
      .post<{ name: string }>(
        "https://pairbnb-9ffd7.firebaseio.com/offered-places.json",
        {
          ...newPlace,
          id: null,
        }
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap((places) => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
    // this._places.push(newPlace);
    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap((places) => {
    //     this._places.next(places.concat(newPlace));
    //   })
    // );
  }

  updatePlace(placeId: string, title: string, desc: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
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
        // console.log(placeId);
        return this.http.put(
          `https://pairbnb-9ffd7.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
