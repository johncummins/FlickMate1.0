import { Component, Input, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { MovieObj } from 'src/app/models/movieObj';
import { FollowService } from 'src/app/services/follow.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ReadMovieService } from 'src/app/services/read-movie.service';
import { size } from 'lodash';
import { User } from 'src/app/models/user';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Observable, combineLatest, of } from 'rxjs';
import { zip } from 'rxjs'
import { map } from 'rxjs/operators'
import { LoadingController } from '@ionic/angular';



@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {

  @Input() inputtedUser;
  @Input() currentUserBool;

  profileID;
  currentUserID;
  topMovieArr = [];
  movieDetails = {} as MovieObj;
  movieTemp = {} as any;
  catMovieID = [];
  loading: any;

  top10List: any;

  top10Num = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];


  public posterUrl = 'https://www.themoviedb.org/t/p/w342';
  public segmentCategory: string = 'top10';
  showTop10: boolean = true;
  showWatchlist: boolean = false;
  showReceived: boolean = false;
  showSent: boolean = false;
  showEditBtn: boolean = false;
  hideRecTabs = false;
  hideRateDiff = true;
  showRecommendations;
  combinedTotDiff: number = 0;

  receivedRecs$;
  sentRecs$;
  allRecs$;
  top10$;
  watchlist$;

  constructor(private profile: ProfileService, private readmovieservice: ReadMovieService, public followService: FollowService, private router: Router, public auth: AuthService, public loadingController: LoadingController) {
    // this.listItems = [
    //   "1. Aylin Roberts",
    //   "2. Autumn Kuhic",
    //   "3. Tiffany Windler",
    //   "4. Sheila Bauch",
    //   "5. Diana Gerhold",
    //   "6. Arielle Kuhn"
    // ];
  }

  onRenderItems(event) {
    console.log(`Moving item from ${event.detail.from} to ${event.detail.to}`);
    let draggedItem = this.top10List.splice(event.detail.from, 1)[0];
    this.top10List.splice(event.detail.to, 0, draggedItem)
    //this.listItems = reorderArray(this.listItems, event.detail.from, event.detail.to);
    event.detail.complete();
  }

  toggleReorder() {
    console.log("button working")
    const reorderGroup = document.getElementById('reorder') as HTMLButtonElement;
    reorderGroup.disabled = !reorderGroup.disabled;
    reorderGroup.disabled = false;
    this.showEditBtn = true;
    // reorderGroup.addEventListener('ionItemReorder', ({  event.det  }) => {
    //   disabled.complete(true);
    // });
  }

  updateList() {
    console.table(this.top10List);
    this.profile.updateTop10List(this.profileID, this.top10List);
    const reorderGroup = document.getElementById('reorder') as HTMLButtonElement;
    reorderGroup.disabled = true;
    this.showEditBtn = false;

  }

  async ngOnInit() {
    //to get currentUser id
    const { uid } = await this.auth.getUser();
    this.currentUserID = uid

    if (this.currentUserBool == true) {
      this.hideRecTabs = true;
    }
    else {
      this.hideRecTabs = false;
    }
    this.hideRateDiff = true;

    this.profileID = this.inputtedUser.uid;

    // set profileID depending on currentUser
    if (this.profileID !== undefined) {
      this.getTop10();
      console.log("THe profile id is not undefinred")
    }
    else if (this.profileID = this.currentUserID) {
      this.getTop10();

    }
    else {
      this.profileID = uid;
      this.getTop10();
    }
  }

  getTop10() {
    this.turnFalse();
    this.showTop10 = true;
    this.top10$ = this.profile.getProfileContent(this.profileID, this.segmentCategory);
    this.top10$.subscribe((result) => {
      console.log("This is the result from the top10: ", result);
      this.top10List = result;
    })
  }

  getWatchlist() {
    this.turnFalse();
    this.showWatchlist = true;
    this.watchlist$ = this.profile.getProfileContent(this.profileID, this.segmentCategory);
  }

  getSentRecs() {
    this.turnFalse();
    this.showSent = true;
    if (this.inputtedUser.uid == this.currentUserID) {
      // get the all the recommendations that the current user has sent
      console.log("This is the current users profile");
    }
    else if (this.inputtedUser.uid !== this.currentUserID) {
      this.sentRecs$ = this.profile.getRecommendations(this.currentUserID, this.inputtedUser);
      this.sentRecs$.subscribe((result) => {
        console.log("************ THis is the result from the get sent recommendations subscription: ", result);
      })

    }
    else {
      console.log("some error retireving the ids with one of the users");
    }

  }

  getreceivedRecs() {
    this.turnFalse();
    this.showReceived = true;
    if (this.inputtedUser.uid == this.currentUserID) {
      // get the all the recommendations that the current user has sent
      console.log("This is the current users profile");
    }
    else if (this.inputtedUser.uid !== this.currentUserID) {
      // recieved recommendations
      this.receivedRecs$ = this.profile.getRecommendations(this.inputtedUser, this.currentUserID);
      this.receivedRecs$.subscribe((result) => {
        console.log("************ THis is the result from the get received recommendations subscription: ", result);
        // console.log("************ THis is the total diff from the recieved: ", result.totalRatingDiff);
      })

    }
    else {
      console.log("some error retireving the ids with one of the users");
    }

  }

  getDiffRating() {
    this.combinedTotDiff = 0;

    if (this.inputtedUser.uid !== this.currentUserID) {
      // recieved recommendations
      console.log("InputteuserID: ", this.inputtedUser.uid);
      console.log("CurrentuserID: ", this.currentUserID);

      this.receivedRecs$ = this.profile.getTotalRatingDiff(this.inputtedUser, this.currentUserID);
      this.receivedRecs$.subscribe((result: number) => {
        this.combinedTotDiff = result;
        console.log("************ THis is the total diff from the recieved: ", this.combinedTotDiff);
        this.getSentDiffRating();
      })
    }
    else {
      console.log("Error retireving the ids with one of the users");
    }
  }


  getSentDiffRating() {
    this.sentRecs$ = this.profile.getTotalRatingDiff(this.currentUserID, this.inputtedUser);
    // this.sentRecs$.subscribe((result: number) => {
    //   if (result !== undefined) {
    //     let invertedResult = result * -1
    //     this.combinedTotDiff += invertedResult;
    //     console.log("THis is the result: ", result);
    //     console.log("THis is the recevied + sent total diff: ", this.combinedTotDiff);
    //   }
    //   // else if (this.combinedTotDiff == 0 || undefined) {

    //   // }
    //   else {
    //     console.log("THis is the this.combinedTotDiff: ", this.combinedTotDiff);
    //     this.hideRateDiff = false;

    //   }

    // })
  }

  turnFalse() {
    this.showTop10 = false;
    this.showWatchlist = false;
    this.showReceived = false;
    this.showSent = false;
  }

  viewMovie(movieID) {
    // Create Navigation Extras object to pass to movie page
    // This is passed into movie page from tab2.page.html
    let navigationExtras: NavigationExtras = {
      state: { movieID },
    };
    this.router.navigate(['tabs/tab4/movie-page'], navigationExtras);
  }

  // async presentLoading() {
  //   this.loading = await this.loadingController.create({
  //     message: 'Loading...'
  //   });
  //   await this.loading.present();
  // }

  // async initializeApp() {
  //   this.presentLoading();
  //   await Promise.all([
  //     this.top10$.toPromise()
  //   ])
  //   await this.loading.dismiss();
  // }



}
