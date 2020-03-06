import { ScrollComponent } from './../Scroll/Scroll.component';
import { HttpService } from './../shared/http.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from 'ngb-modal';

@Component({
  selector: 'results-component',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private httpservice: HttpService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }


  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);
    // .filter(params => params.order)
    this.route.queryParams
      .subscribe(params => {
        console.log(params); // {order: "popular"}

        this.username = params.username;
        console.log(this.username); // popular
        if (this.username) {
          console.log("WORKS");
          this.toggleSubmit();
        }
      });
    this.getUsers();
  }
  selected;
  submitted = true;
  start = true;
  loading = 'block';
  bot = [];
  index = 0;
  json = [];
  src = "";
  final;
  image = 'hidden';
  username;
  users = [];
  error = false;
  link = '';
  name: string;
  color: string;
  watched = false;
  Watched(like) {
    let feedback = {
      "tmdbId": this.json[this.index].tmdbId,
      "like": like,
      "username":this.username
    }
    let body = new FormData();
    body.append('feedback', JSON.stringify(feedback))
    this.httpservice.SendPost('/api/v2/watched', body).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      },
      ()=>{
        console.log("completed")
      });

      this.submitted = false;
      this.watched = false;
      this.nextPoster(0);
  }

  watchedAlready() {
    this.watched = true;
    this.submitted = true;
  }
  openDialog(): void {
    console.log("opening one day");
  }

  getUsers() {
    this.httpservice.SendGet('/api/v2/users').subscribe((data) => {
      console.log(data);
      this.users = [];
      data.forEach(user => {
        this.users.push(user);
      });
    });
  }
  checkValidLink(link): Boolean {
    this.httpservice.SendGet("https://www11.123movie.cc/movies/" + link + "/", "").subscribe((data) => {
      console.log(data);
      return true
    });
    return false
  }
  watchMovie() {
    let title = this.json[this.index].original_title;
    let body = new FormData();
    body.append('title', JSON.stringify(title))
    this.httpservice.SendPost('/api/v2/pirate', body).subscribe((data) => {
      console.log(data);
      console.log(data[0]);
      if (this.checkValidLink(data[0])) {
        this.link = "https://www11.123movie.cc/movies/" + data[0] + "/";
      }
      else if (this.checkValidLink(data[1])) {
        this.link = "https://www11.123movie.cc/movies/" + data[1] + "/";
      }
      else {
        this.link = "https://www11.123movie.cc/search/?s=" + title;
      }
      console.log(this.link);
      window.open(this.link);
      // this.router.navigate(['/results'], { queryParams: { username: this.username }, queryParamsHandling: 'merge' });
    });
  }
  makeGroup(users) {
    let body = new FormData();
    body.append('users', JSON.stringify(users))
    this.httpservice.SendPost('/api/v2/combine', body).subscribe((data) => {
      console.log(data);
      this.username = data;
      this.router.navigate(['/results'], { queryParams: { username: this.username }, queryParamsHandling: 'merge' });
    });
  }

  toggleLoad() {
    this.image = 'unset';
  }
  toggleSubmit() {
    if (this.username) {
      this.submitted = false;
      this.getJSON().then(data => {
        this.error = false;
        this.json = data;

        // this.json = this.shuffleArray(this.json); SORT ARRAY?
        // console.log(JSON.stringify(this.json[0]));
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
      }).catch((err) => {
        this.error = true;
        this.start = true;
        this.submitted = true;
        console.log(this.error);
        console.log("Error");
      });
    }
    else {
      console.log(this.selected);
      let users = [];
      this.selected.forEach(name => {
        let obj = { "name": name }
        users.push(obj);
      });
      console.log(users);
      this.makeGroup(users);

      // this.submitted = false;
    }

  }
  nextPoster(like) {
    console.log(this.username);
    this.loading = 'none';
    this.image = 'hidden';
    this.src = "";
    this.final = JSON.stringify(this.json);
    if (like != 0) {
      this.json[this.index].like = like;
      this.bot.push(this.json[this.index]);
      console.log(this.bot);
    }
    this.index += 1;
    this.src = "https://image.tmdb.org/t/p/w1280/" + this.json[this.index].poster_path;

    this.loading = 'block';
    this.start = true;
  }

  lastPoster() {
    this.loading = 'none';
    this.src = "assets/loader.gif";
    this.index -= 1;
    this.src = "https://image.tmdb.org/t/p/w1280/" + this.json[this.index].poster_path;
    this.loading = 'block';
    this.start = true;
  }
  public getJSON(): Promise<any> {
    this.start = false;
    const response = this.http.get("assets/predictions/" + this.username + "-Predictions.json").pipe(
      map((r) => r)
    ).toPromise();
    return response;
  }
}
