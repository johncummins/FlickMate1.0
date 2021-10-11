import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';



@Injectable({
  providedIn: 'root'
})
export class FollowService {

  constructor(private afs: AngularFirestore, private auth: AuthService,

  ) {
  }

  getUsers() {
    // Used to build the follower count
    return this.afs.collection(`users/`);
    // return this.afStore.collection(`users/`).doc(`${userToSearch}`);
  }

  getFollowers(userId: string) {
    // Used to build the follower count
    return this.afs.collection(`followers/`).doc(`${userId}`);
  }

  getFollowing(userId: string) {
    // Used to build the following count
    return this.afs.collection(`following/`).doc(`${userId}`);
  }

  getUserList() {
    let tempUser = ["9krRAy1dxKZJTe4xOd6VvMGQWvj2", "JMbNO0FXEgNDtgNVLFTmBAtrhwC2"]

    // return this.afs
    //   .collection('users', ref => ref.where('uid', '==', tempUser))
    //   .snapshotChanges()
    //   .pipe(
    //     map(actions => {
    //       return actions.map(a => {
    //         const data: Object = a.payload.doc.data();
    //         const id = a.payload.doc.id;
    //         return { id, ...data };
    //       });
    //     })
    //   );

    // return this.afs.collection().get().toPromise()
    //   .then((collections) => {
    //     let tempFollowingArr = []
    //     let tempFollowerArr = []
    //     collections.forEach((doc) => {
    //       if (this.showFollowing) {
    //         // console.log("Show following has been clicked: ", this.showFollowing);
    //         for (let index = 0; index < this.inUserFollowingArr.length; index++) {
    //           if (doc.id == this.inUserFollowingArr[index]) {
    //             // console.log("These have a match: ", doc.id)
    //             tempFollowingArr.push({ id: doc.id, data: doc.data() });
    //           }
    //         }
    //       }
    //     })


    //   }
    //   )
  }


  isFollowing(followerId: string) {
    // Used to see if UserFoo if following UserBar
    return this.afs.collection(`following/`).doc(`${followerId}`);
  }

  follow(followerId: string, followedId: string) {
    // if the follower id does not exist here then use set, otherwise use update
    const followerRef = this.afs.doc(`followers/${followedId}`);
    const followingRef = this.afs.doc(`following/${followerId}`);

    followerRef.get().toPromise()
      .then(docSnapshot => {
        if (docSnapshot.exists && followerId == undefined)
          console.log("Error: cannot add follower, The user is not defined (not logged in)")
        else if (docSnapshot.exists)
          followerRef.update({ [followerId]: true })
        else
          followerRef.set({ [followerId]: true })
      });

    followingRef.get().toPromise()
      .then(docSnapshot => {
        if (docSnapshot.exists && followerId == undefined)
          console.log("Error: cannot add following, The user is not defined (not logged in)")
        else if (docSnapshot.exists)
          followingRef.update({ [followedId]: true })
        else
          followingRef.set({ [followedId]: true })
      });
  }

  unfollow(followerId: string, followedId: string) {
    this.afs.doc(`followers/${followedId}`).update({ [followerId]: firebase.firestore.FieldValue.delete() })
    this.afs.doc(`following/${followerId}`).update({ [followedId]: firebase.firestore.FieldValue.delete() })
    // this.afStore.doc(`following/${followedId}`).update({ [followerId]: null })
    // this.afStore.doc(`following/${followerId}`).update({ [followedId]: null })
  }
}
