import { Component, OnInit, Input, HostListener } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PhotoModel } from 'src/app/models/photo.model';
import { AlbumService } from 'src/app/services/album.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';

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
    private location: Location, private route: ActivatedRoute, private apiService: ApiService,
    private toast: ToastrService) { }

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
      this.albumService.updatePhoto(photo);
      this.editMode = false;
      this.toast.success(photo.title + ' a été mise à jour',
        'Photo mise à jour',
        {timeOut: 3000,});
    }, error => {
      console.log(error);
      this.toast.error('Les modifications de ' + this.photo.title + 'n\'ont pas été enregistrées',
          'Echec de la modification',
          {timeOut: 4000,});
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
          const photoTitle = this.albumService.currentPhoto.title;
          this.albumService.deleteCurrentPhoto();
          let cururl = this.location.path().replace( "photos/"+previousPhotoId, "photos/" + this.albumService.currentPhoto.idPhoto );
          this.location.go(cururl);
          this.photo = this.albumService.currentPhoto;
          this.deleteMode = false;
          this.toast.success(photoTitle,
            'Photo supprimé',
            {timeOut: 3000,});
          if (this.albumService.currentAlbum.photos.length === 0){
            this.returnGalery();
          }
        },
        error: error => {
          this.toast.error(this.albumService.currentPhoto.title,
          'Echec de la suppression',
          {timeOut: 4000,});
          console.error('There was an error in delete!', error);
        }
    });
  }

  setCover(){
    this.apiService.putCover(this.albumService.currentAlbum, this.albumService.currentPhoto).subscribe(
      {
        next: album => {
          this.albumService.currentAlbum.coverPhoto = this.albumService.currentPhoto;
          this.toast.success( this.albumService.currentPhoto.title,
            'Photo de couverture',
            {timeOut: 3000,});
        },
        error: error => {
          this.toast.error('La photo de couverture n\'a pas été mise à jour',
          'Echec de la modification',
          {timeOut: 4000,});
          console.error('There was an error in seting cover!', error);
        }
    });
  }

  unsetCover(){
    this.apiService.putNoCover(this.albumService.currentAlbum).subscribe(
      {
        next: album => {
          this.albumService.currentAlbum.coverPhoto = null;
          this.toast.success( this.albumService.currentPhoto.title,
            'Photo de couverture enlevé',
            {timeOut: 3000,});
        },
        error: error => {
          this.toast.error('La photo de couverture n\'a pas été enlevé',
          'Echec de la modification',
          {timeOut: 4000,});
          console.error('There was an error in seting cover!', error);
        }
    });
  }

}
