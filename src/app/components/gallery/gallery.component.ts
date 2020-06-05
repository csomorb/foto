import { Component, OnInit, Input, HostListener } from '@angular/core';
import { PhotoModel } from 'src/app/models/photo.model';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  ESCAPE = 27
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  @Input() photos: Array<PhotoModel>;

  photoBaseUrl: string = environment.apiUrl;
  curentPhoto?: PhotoModel;
  nextPhoto?: PhotoModel;
  prevPhoto?: PhotoModel;

  constructor(private router: Router ) { }

  ngOnInit(): void {
    this.curentPhoto = null;
  }

  loadPhoto(photo: PhotoModel){
    console.log(photo);
    this.curentPhoto = photo;
    this.getNextPrevPhoto(photo);
  }

  returnGalery(){
    this.curentPhoto = null;
    this.nextPhoto = null;
    this.prevPhoto = null;
  }

  moveNextPhoto(){
    if(this.nextPhoto){
      this.curentPhoto = this.nextPhoto;
      this.getNextPrevPhoto(this.curentPhoto);
    }
  }

  movePrevPhoto(){
    if(this.prevPhoto){
      this.curentPhoto = this.prevPhoto;
      this.getNextPrevPhoto(this.curentPhoto);
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.curentPhoto){
      if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
        this.moveNextPhoto();
      }
      if (event.keyCode === KEY_CODE.LEFT_ARROW) {
        this.movePrevPhoto();
      }
      if (event.keyCode === KEY_CODE.ESCAPE) {
        this.returnGalery();
      }
    }
  }

  getNextPrevPhoto(photo: PhotoModel){
    let currentPosition = this.photos.indexOf(photo);
    if (currentPosition < this.photos.length){
      this.nextPhoto = this.photos[currentPosition + 1];
    }
    else{
      this.nextPhoto = null;
    }
    if (currentPosition > 0){
      this.prevPhoto = this.photos[currentPosition - 1];
    }
    else{
      this.prevPhoto = null;
    }
  }

  triPriseDeVueAncienRecent(){
    this.photos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    });
  }

  triPriseDeVueRecentAncien(){
    this.photos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return 0;
    });
  }

  triAZ(){
    this.photos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }

  triZA(){
    this.photos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return 1;
      if (titleA > titleB) return -1;
      return 0;
    });
  }

}
