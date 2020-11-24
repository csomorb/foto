import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { PhotoModel } from 'src/app/models/photo.model';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { ApiService } from 'src/app/services/api.service';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators'

@Component({
  selector: 'app-gallery',
  template: '',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  @Input() photos: Array<PhotoModel>;

  masterSelected:boolean;
  photoBaseUrl: string = environment.apiUrl;
  editMode: boolean;
  deleteMode: boolean;
  triMode: boolean;
  selectedPhotos: Array<any>;
  selectedVideos: Array<any>;
  selectedAlbumToMovePhoto: number;
  nbSelectedItem: number;
  addMode: boolean;

  constructor(public router: Router, public catService: CategoryService, public apiService: ApiService,public toast: ToastrService, public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.editMode = false;
    this.deleteMode = false;
    this.triMode = false;
    this.addMode = false;
    this.selectedPhotos = [];
    this.selectedVideos = [];
  }

  loadPhoto(photo: PhotoModel){
    this.catService.loadPhoto(photo);
    this.route.pathFromRoot[1].url.pipe(first()).subscribe( val => this.router.navigateByUrl('/'+val[0].path+'/'+this.catService.curCat.id +'/photos/' + photo.idPhoto));
  }

  goToCategory(id){
    this.route.pathFromRoot[1].url.pipe(first()).subscribe( val => this.router.navigateByUrl('/'+val[0].path+'/'+id));
  }

  gotToPeople(id){
    this.router.navigateByUrl('/peoples/'+id);
  }

  triPriseDeVueAncienRecent(){
    this.catService.curCat.photos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    });
    this.catService.curCat.videos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    });
    this.triMode = false;
  }

  triPriseDeVueRecentAncien(){
    this.catService.curCat.photos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return 0;
    });
    this.catService.curCat.videos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return 0;
    });
    this.triMode = false;
  }

  triAZ(){
    this.catService.curCat.photos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
    this.catService.curCat.videos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
    this.triMode = false;
  }

  triZA(){
    this.catService.curCat.photos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return 1;
      if (titleA > titleB) return -1;
      return 0;
    });
    this.catService.curCat.videos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return 1;
      if (titleA > titleB) return -1;
      return 0;
    });
    this.triMode = false;
  }

  toEditMode(){
    this.editMode = true;
    this.selectedPhotos = this.catService.curCat.photos;
    this.selectedPhotos.forEach(photo => photo.isSelected = false);
    this.selectedPhotos.forEach(photo => photo.deleteMode = false);
    this.selectedVideos = this.catService.curCat.videos;
    this.selectedVideos.forEach(video => video.isSelected = false);
    this.selectedVideos.forEach(video => video.deleteMode = false);
    this.nbSelectedItem = 0;
  }

  cancelEditMode(){
    this.editMode = false;
  }

  toDeleteMode(){
    this.deleteMode = true;
  }

  toAddMode(){
    this.addMode = true;
  }

  cancelAddMode(){
    this.addMode = false;
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

  checkUncheckAll() {
    for (var i = 0; i < this.selectedPhotos.length; i++) {
      this.selectedPhotos[i].isSelected = this.masterSelected;
    }
    for (var i = 0; i < this.selectedVideos.length; i++) {
      this.selectedVideos[i].isSelected = this.masterSelected;
    }
    this.nbSelectedItem = this.selectedPhotos.reduce((a, photo)=> {return photo.isSelected?a+1:a;} ,0);
    this.nbSelectedItem = this.selectedVideos.reduce((a, video)=> {return video.isSelected?a+1:a;} ,0);
  }

  isAllSelected() {
    this.masterSelected = this.selectedPhotos.every(function(item:any) {
        return item.isSelected == true;
    }) && this.selectedVideos.every(function(item:any) {
      return item.isSelected == true;
    });
    this.nbSelectedItem = this.selectedPhotos.reduce((a, photo)=> {return photo.isSelected?a+1:a;} ,0);
    this.nbSelectedItem = this.selectedVideos.reduce((a, video)=> {return video.isSelected?a+1:a;} ,0);
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
            this.catService.deletePhoto(idPhotoToDelete);
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
      this.catService.updatePhoto(photoUp);
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

  selectPhoto(photo){
    photo.isSelected = !photo.isSelected;
    this.isAllSelected();
  }

  setSelectedAlbumToMove(idAlbum){
    this.selectedAlbumToMovePhoto = idAlbum;
  }

  setCover(photo){
    this.route.pathFromRoot[1].url.pipe(first()).subscribe( val => {
      this.apiService.putCover(this.catService.curCat, photo, val[0].path).subscribe(
        {
          next: album => {
            this.catService.curCat.coverPhoto = photo;
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
    });
  }

  unsetCover(photo){
    this.route.pathFromRoot[1].url.pipe(first()).subscribe( val => {
      this.apiService.putNoCover(this.catService.curCat, val[0].path).subscribe(
      {
        next: album => {
          this.catService.curCat.coverPhoto = null;
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
    });
  }

}
