import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { ReviewService } from 'src/app/services/review.service';
import { Review } from 'src/app/shared/review';


@Component({
  selector: 'app-review-modal',
  templateUrl: './review-modal.page.html',
  styleUrls: ['./review-modal.page.scss'],
})
export class ReviewModalPage implements OnInit {

  @Input() movieToReviewID: string;
  @Input() movieToReviewTitle: string;
  inputtedReview: string;
  inputtedRating: number;
  inputtedTags: any;

  constructor(
    private modalCtr: ModalController,
    public reviewService: ReviewService

  ) { }

  ngOnInit() {
  }

  async close() {
    const closeModal: string = "Modal Closed";
    await this.modalCtr.dismiss(closeModal);
  }

  submitReview() {
    if (this.inputtedReview != null) {
      const currentDate = new Date()
      console.log("Current Date " + currentDate)

      const userReview: Review = {
        date: currentDate,
        likes: null,
        movieID: this.movieToReviewID,
        rating: this.inputtedRating,
        tags: this.inputtedTags,
        content: this.inputtedReview,
        title: this.movieToReviewTitle,
        comments: null
      };
      console.log("This is the review content: " + this.inputtedReview)
      this.reviewService.submitReview(userReview)
    }
    else {
      window.alert('Please enter your review in the text box');
      return false;
    }
  }
}
