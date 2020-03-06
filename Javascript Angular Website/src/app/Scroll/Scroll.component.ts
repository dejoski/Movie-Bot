import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { HttpService } from '../shared/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';



@Component({
  selector: 'Scroll-component',
  templateUrl: './Scroll.component.html',
  styleUrls: ['./Scroll.component.css']
})
export class ScrollComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private httpservice: HttpService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {

    console.log('Reading local json files');
  }
  public getJSON(): Promise<any> {
    this.start = false;
    const response = this.http.get("assets/csvjson (1).json").pipe(
      map((r) => r)
    ).toPromise();
    return response;
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let x = event.key;
    if (x === '1') {
      this.lastPoster();
    }
    if (x === '2') {
      this.nextPoster(1);
    }
    if (x === '3') {
      this.nextPoster(-1);
    }
    if (x === '4') {
      this.nextPoster(0);
    }
  }

  public getPoster(test: String): Observable<any> {
    return this.http.get("//image.tmdb.org/t/p/w1280" + test);
  }

  complete() {
    this.httpservice.SendPost('/api/v2/test_response',this.json).subscribe((data) => {
      console.log(data)
    })
    // this.downloadJson(this.bot);
  }

  // TODO: add support for keystrokes
  nextPoster(like) {
    console.log(this.username);
    this.loading = 'none';
    this.image = 'hidden';
    this.src = "";
    this.final = JSON.stringify(this.bot);
    if (like != 0) {

      this.json[this.index].like = like;
      let found = this.bot.indexOf(this.json[this.index]);
      if (found == -1) {

        this.progress += 5;
        this.bot.push(this.json[this.index]);
      }
      else {
        this.bot[found].like = like;
      }
      console.log(this.bot);
    }
    this.index += 1;
    this.src = "https://image.tmdb.org/t/p/w1280/" + this.json[this.index].poster_path;

    this.loading = 'block';
    this.start = true;
  }

  lastPoster() {
    if (this.index != 0) {
      this.loading = 'none';
      this.src = "assets/loader.gif";
      this.index -= 1;
      this.src = "https://image.tmdb.org/t/p/w1280/" + this.json[this.index].poster_path;

      this.loading = 'block';
      this.start = true;
    }
  }
  // TODO: when going back to fix a movies data, please overwrite not create another
  loading = 'block';
  bot = [];
  index = 0;
  json = <Object>[];
  src = "";
  start = false;
  final;
  error='';
  submitted = false;
  progress = 5;
  users = [];
  toggleLoad() {
    this.image = 'unset';
  }
  toggleSubmit(form) {
    this.error = '';
    if (this.username != '') {
      this.httpservice.SendGet('/api/v2/users').subscribe((data)=>{
        this.users = data;

      console.log(this.users);
      console.log(this.users[this.users.length]);
      console.log(this.username);
      console.log(this.users.includes(this.username));

      if(this.users.includes(this.username)==true){
        console.log("ERRRRORR!!");
        this.error = "Username is taken, please change the name and try again";
      }
      else{
      this.submitted = true;
      // form.submit();

      let body = new FormData();
      body.append('data',this.final);
      body.append('username',this.username);
      this.httpservice.SendPost("/api/v2/test_response",body).subscribe((data)=>{
        console.log(data);
        this.router.navigate(['/results'], { queryParams: { username: this.username }, queryParamsHandling: 'merge' });
      },(error)=>{
        console.log("FAIL!");
        this.error = "Server Error, Please try again"
        this.submitted = false;},
        ()=>{this.submitted = false;})}
      });
    }
  }
  image = 'hidden';
  username = '';

  shuffleArray = function (array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  }

  ngOnInit() {

    this.getJSON().then(data => {
      this.json = data;
      this.json = this.shuffleArray(this.json).slice(0,200);
      this.src = "https://image.tmdb.org/t/p/w1280/" + this.json[this.index].poster_path;
      this.start = true;
      var shuffleArray = function (array) {
        var m = array.length, t, i;

        // While there remain elements to shuffle
        while (m) {
          // Pick a remaining element…
          i = Math.floor(Math.random() * m--);

          // And swap it with the current element.
          t = array[m];
          array[m] = array[i];
          array[i] = t;
        }

        return array;
      }
    });
  }
}

