import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class HttpService {

  // Base url
  baseurl = 'https://xtrodev.info/python';

  constructor(private http: HttpClient) { }

  // Http Headers
  httpOptions = {
    headers: new HttpHeaders({
      // 'Content-Type': 'application/json',
      // 'Access-Control-Allow-Headers': 'Content-Type',
      // 'Access-Control-Allow-Origin': '*'
    })
  }
  // JSON.stringify([
  //   {
  //       "tmdbId": 9762,
  //       "original_language": "en",
  //       "original_title": "Step Up",
  //       "popularity": 14.21769,
  //       "poster_path": "/uy1kUNtvYTZLkBSpQP8FQMRdAg7.jpg",
  //       "release_date": "8/11/2006",
  //       "like": 1
  //   },
  //   {
  //       "tmdbId": 607,
  //       "original_language": "en",
  //       "original_title": "Men in Black",
  //       "popularity": 15.781024,
  //       "poster_path": "/f24UVKq3UiQWLqGWdqjwkzgB8j8.jpg",
  //       "release_date": "7/2/1997",
  //       "like": 1
  //   }]
  // )
  // POST
  SendPost(route,data): Observable<any> {
    return this.http.post(this.baseurl + route,data)
    .pipe(
      map((response)=> response),
      catchError(this.errorHandl)
    )
  }

  SendGet(route,baseurl=this.baseurl): Observable<any> {
    return this.http.get(baseurl + route)
    .pipe(
      map((response)=> response),
      catchError(this.errorHandl)
    )
  }

  // Error handling
  errorHandl(error) {
     let errorMessage = '';
     if(error.error instanceof ErrorEvent) {
       // Get client-side error
       errorMessage = error.error.message;
     } else {
       // Get server-side error
       errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
     }
    //  console.log(errorMessage);
     return throwError(errorMessage);
  }

}
