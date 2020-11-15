import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { PhotoModel } from 'src/app/models/photo.model';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from 'src/app/services/album.service';
import { ApiService } from 'src/app/services/api.service';
import { AlbumModel } from 'src/app/models/album.model';
import { ToastrService } from 'ngx-toastr';

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
  nbSelectedPhoto: number;

  constructor(private router: Router, public albumService: AlbumService, private apiService: ApiService,private toast: ToastrService) { }

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
    this.nbSelectedPhoto = 0;
  }

  cancelEditMode(){
    this.editMode = false;
  }

  toDeleteMode(){
    if (this.albumService.currentAlbum.listAlbum.length > 0){
      this.toast.warning('Supprimez d\'abord les sous albums',
        'Attention',
        {timeOut: 4000,});
    }
    else if (this.albumService.currentAlbum.photos.length > 0){
      this.toast.warning('Supprimez d\'abord les photos',
        'Attention',
        {timeOut: 4000,});
    }
    else{
      this.deleteMode = true;
    }

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
          const albumTitle = this.albumService.currentAlbum.title;
          this.albumService.deleteCurrentAlbumFromCache();
          this.router.navigateByUrl("albums/" + albumParentId);
          this.deleteMode = false;
          this.toast.success(albumTitle,
            'Album supprimé',
            {timeOut: 3000,});
        },
        error: error => {
          console.error('There was an error in delete!', error);
          this.toast.error('Détails: '+error.error,
          'Echec de la suppression',
          {timeOut: 4000,});
        }
    });
  }

  updateAlbum(){
    this.apiService.updateAlbum(this.album).subscribe({
        next: album => {
          this.albumService.updateCurrentAlbumFromCache(album);
          this.editMode = false;
          this.toast.success('L\'album ' + album.title + ' a été mise à jour',
            'Mise à jour',
            {timeOut: 3000,});
        },
        error: error => {
          this.toast.error('Détails: '+error.statusText,
          'Echec de la mise à jour',
          {timeOut: 4000,});
          console.error('There was an error in update!', error);
        }
    });
  }

  checkUncheckAll() {
    for (var i = 0; i < this.selectedPhotos.length; i++) {
      this.selectedPhotos[i].isSelected = this.masterSelected;
    }
    this.nbSelectedPhoto = this.selectedPhotos.reduce((a, photo)=> {return photo.isSelected?a+1:a;} ,0);
  }
  isAllSelected() {
    this.masterSelected = this.selectedPhotos.every(function(item:any) {
        return item.isSelected == true;
    });
    this.nbSelectedPhoto = this.selectedPhotos.reduce((a, photo)=> {return photo.isSelected?a+1:a;},0);
  }

  deletePhoto(photo){
    photo.deleteMode = true;
  }

  deleteCancelPhoto(photo){
    photo.deleteMode = false;
  }

  deleteConfPhoto(photo){
    const idPhotoToDelete = photo.idPhoto;
    const photoTitle = photo.title;
    this.apiService.deletePhoto(photo).subscribe(
      {
        next: data => {
          this.toast.success(photoTitle,
              'Photo supprimé',
              {timeOut: 3000,});
            this.albumService.deletePhoto(idPhotoToDelete);
        },
        error: error => {
          this.toast.error('Echec de la suppression de ' + photoTitle,
          'Echec de la suppression',
          {timeOut: 4000,});
            console.error('There was an error in delete!', error);
        }
    });
  }

  updatePhotoDate(photo, dateChanged){
    if(dateChanged){
      this.updatePhoto(photo);
    }
  }

  updatePhoto(photo){
    this.apiService.putPhoto(photo).subscribe( photoUp =>{
      this.albumService.updatePhoto(photoUp);
      this.toast.success(photoUp.title + ' a été mise à jour',
        'Photo mise à jour',
        {timeOut: 3000,});
    }, error => {
      console.log(error);
      this.toast.error('Les modifications de ' + photo.title + 'n\'ont pas été enregistrées',
          'Echec de la modification',
          {timeOut: 4000,});
    });
  }

  setCover(photo){
    this.apiService.putCover(this.albumService.currentAlbum, photo).subscribe(
      {
        next: album => {
          this.albumService.currentAlbum.coverPhoto = photo;
          this.toast.success( photo.title,
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

  unsetCover(photo){
    this.apiService.putNoCover(this.albumService.currentAlbum).subscribe(
      {
        next: album => {
          this.albumService.currentAlbum.coverPhoto = null;
          this.toast.success( photo.title,
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

  selectPhoto(photo){
    photo.isSelected = !photo.isSelected;
    this.isAllSelected();
  }

  setSelectedAlbumToMove(idAlbum){
    this.selectedAlbumToMovePhoto = idAlbum;
  }

}
