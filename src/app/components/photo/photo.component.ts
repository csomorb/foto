import { Component, OnInit, Input, HostListener } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PhotoModel } from 'src/app/models/photo.model';
import { AlbumService } from 'src/app/services/album.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  ESCAPE = 27
}

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.css']
})
export class PhotoComponent implements OnInit {

  photoBaseUrl: string = environment.apiUrl;
  photo: PhotoModel;
  editMode: boolean;
  deleteMode: boolean;

  constructor(public albumService: AlbumService, private router: Router,
    private location: Location, private route: ActivatedRoute, private apiService: ApiService) { }

  moveNextPhoto(){
    let previousPhotoId = this.albumService.currentPhoto.idPhoto;
    this.albumService.moveNextPhoto();
    let cururl = this.location.path().replace( "photos/"+previousPhotoId, "photos/" + this.albumService.currentPhoto.idPhoto );
    this.location.go(cururl);
    this.photo = this.albumService.currentPhoto;
  }

  movePrevPhoto(){
    let previousPhotoId = this.albumService.currentPhoto.idPhoto;
    this.albumService.movePrevPhoto();
    let cururl = this.location.path().replace( "photos/"+previousPhotoId, "photos/" + this.albumService.currentPhoto.idPhoto );
    this.location.go(cururl);
    this.photo = this.albumService.currentPhoto;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
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

  returnGalery(){
    this.albumService.returnGalery();
    this.router.navigateByUrl("/albums/"+this.albumService.currentAlbum.id);
  }

  toEditMode(){
    this.editMode = true;
    this.photo = this.albumService.currentPhoto;
  }

  cancelEditMode(){
    this.editMode = false;
  }

  updatePhoto(){
    this.apiService.putPhoto(this.photo).subscribe( photo =>{
      console.log(photo);
      this.albumService.updatePhoto(photo);
      this.editMode = false;
    }, error => {
      console.log(error);
      // TODO: Message échec de l'enregistrement
    });

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const idPhoto = parseInt(params.get('idPhoto'));
      this.albumService.loadPhotoFromId(idPhoto);
    });
    this.editMode = false;
    this.editMode = false;
  }

  toDeleteMode(){
    this.deleteMode = true;
  }

  cancelDeleteMode(){
    this.deleteMode = false;
  }

  deletePhoto(){
    this.apiService.deletePhoto(this.albumService.currentPhoto).subscribe(
      {
        next: data => {
            let previousPhotoId = this.albumService.currentPhoto.idPhoto;
            this.albumService.deleteCurrentPhoto();
            let cururl = this.location.path().replace( "photos/"+previousPhotoId, "photos/" + this.albumService.currentPhoto.idPhoto );
            this.location.go(cururl);
            this.photo = this.albumService.currentPhoto;
            this.deleteMode = false;
            if (this.albumService.currentAlbum.photos.length === 0){
              this.returnGalery();
            }
        },
        error: error => {
            // TODO:
            console.error('There was an error in delete!', error);
        }
    });
  }

  setCover(){
    this.apiService.putCover(this.albumService.currentAlbum, this.albumService.currentPhoto).subscribe(
      {
        next: album => {
            this.albumService.currentAlbum.coverPhoto = this.albumService.currentPhoto;
        },
        error: error => {
            // TODO:
            console.error('There was an error in seting cover!', error);
        }
    });
  }

  unsetCover(){
    this.apiService.putNoCover(this.albumService.currentAlbum).subscribe(
      {
        next: album => {
            this.albumService.currentAlbum.coverPhoto = null;
        },
        error: error => {
            // TODO:
            console.error('There was an error in seting cover!', error);
        }
    });
  }

}
