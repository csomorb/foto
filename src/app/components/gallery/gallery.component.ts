import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { PhotoModel } from 'src/app/models/photo.model';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from 'src/app/services/album.service';
import { ApiService } from 'src/app/services/api.service';
import { AlbumModel } from 'src/app/models/album.model';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  @Input() photos: Array<PhotoModel>;

  masterSelected:boolean;
  photoBaseUrl: string = environment.apiUrl;
  editMode: boolean;
  deleteMode: boolean;
  triMode: boolean;
  album: AlbumModel;
  selectedPhotos: Array<any>;
  selectedAlbumToMovePhoto: number;

  constructor(private router: Router, public albumService: AlbumService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.editMode = false;
    this.deleteMode = false;
    this.triMode = false;
    this.selectedPhotos = [];
  }

  loadPhoto(photo: PhotoModel){
    this.albumService.loadPhoto(photo);
    this.router.navigateByUrl('/albums/'+this.albumService.currentAlbum.id +'/photos/' + photo.idPhoto);
  }

  goToAlbum(id){
    this.router.navigateByUrl('/albums/' + id);
  }

  triPriseDeVueAncienRecent(){
    this.albumService.currentAlbum.photos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    });
    this.triMode = false;
  }

  triPriseDeVueRecentAncien(){
    this.albumService.currentAlbum.photos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return 0;
    });
    this.triMode = false;
  }

  triAZ(){
    this.albumService.currentAlbum.photos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
    this.triMode = false;
  }

  triZA(){
    this.albumService.currentAlbum.photos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return 1;
      if (titleA > titleB) return -1;
      return 0;
    });
    this.triMode = false;
  }

  toEditMode(){
    this.editMode = true;
    this.album = this.albumService.currentAlbum;
    this.selectedPhotos = this.albumService.currentAlbum.photos;
    this.selectedPhotos.forEach(photo => photo.isSelected = false);
    this.selectedPhotos.forEach(photo => photo.deleteMode = false);
  }

  cancelEditMode(){
    this.editMode = false;
  }

  toDeleteMode(){
    this.deleteMode = true;
  }

  toTriMode(){
    this.triMode = true;
  }

  cancelTriMode(){
    this.triMode = false;
  }

  cancelDeleteMode(){
    this.deleteMode = false;
  }

  addPhoto(){
    this.router.navigateByUrl("/upload/" + this.albumService.currentAlbum.id);
  }

  deleteAlbum(){
    this.apiService.deleteAlbum(this.albumService.currentAlbum).subscribe(
      {
        next: data => {
            const albumParentId = this.albumService.parentList.pop().id;
            this.albumService.deleteCurrentAlbumFromCache();
            this.router.navigateByUrl("albums/" + albumParentId);
            this.deleteMode = false;
            // TODO: remonter confirmation
        },
        error: error => {
            // TODO:
            console.error('There was an error in delete!', error);
            //error.error <- sous albums et photos
            //error.status
        }
    });
  }

  updateAlbum(){
    this.apiService.updateAlbum(this.album).subscribe({
        next: album => {
            this.albumService.updateCurrentAlbumFromCache(album);
            this.editMode = false;
            // TODO: remonter confirmation
        },
        error: error => {
            // TODO:
            console.error('There was an error in update!', error);
            //error.error <- sous albums et photos
            //error.status
        }
    });
  }

  checkUncheckAll() {
    for (var i = 0; i < this.selectedPhotos.length; i++) {
      this.selectedPhotos[i].isSelected = this.masterSelected;
    }
  }
  isAllSelected() {
    this.masterSelected = this.selectedPhotos.every(function(item:any) {
        return item.isSelected == true;
      })
  }


  deletePhoto(photo){
    photo.deleteMode = true;
  }

  deleteCancelPhoto(photo){
    photo.deleteMode = false;
  }

  deleteConfPhoto(photo){
    const idPhotoToDelete = photo.idPhoto;
    this.apiService.deletePhoto(photo).subscribe(
      {
        next: data => {
            this.albumService.deletePhoto(idPhotoToDelete);
        },
        error: error => {
            // TODO:
            console.error('There was an error in delete!', error);
        }
    });
  }

  updatePhoto(photo){
    this.apiService.putPhoto(photo).subscribe( photoUp =>{
      console.log(photoUp);
      this.albumService.updatePhoto(photoUp);
      // Todo: remonter l'enregistrement
    }, error => {
      console.log(error);
      // TODO: Message échec de l'enregistrement
    });
  }

  setCover(photo){
    this.apiService.putCover(this.albumService.currentAlbum, photo).subscribe(
      {
        next: album => {
            this.albumService.currentAlbum.coverPhoto = photo;
        },
        error: error => {
            // TODO:
            console.error('There was an error in seting cover!', error);
        }
    });
  }

  unsetCover(photo){
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

  selectPhoto(photo){
    photo.isSelected = !photo.isSelected;
  }

  setSelectedAlbumToMove(idAlbum){
    this.selectedAlbumToMovePhoto = idAlbum;
  }

}
