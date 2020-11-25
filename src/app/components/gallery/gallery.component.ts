import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { PhotoModel } from 'src/app/models/photo.model';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { ApiService } from 'src/app/services/api.service';
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
  deleteMultipleMode: boolean;
  selectedPhotos: Array<any>;
  selectedVideos: Array<any>;
  selectedAlbumToMovePhoto: number;
  selectedAlbumToCopyPhoto: number;
  nbSelectedItem: number;
  addMode: boolean;
  timeMode: boolean;
  curTimeLevel: string;
  curYear: number;
  curMonth: number;
  curDay: number;
  prevYear: number;
  nextYear: number;
  prevMonth: number;
  nextMonth: number;
  prevDay: number;
  nextDay: number;

  constructor(public router: Router, public catService: CategoryService, public apiService: ApiService,public toast: ToastrService, public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.editMode = false;
    this.deleteMode = false;
    this.triMode = false;
    this.addMode = false;
    this.timeMode = false;
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

  goToAlbum(id){
     this.router.navigateByUrl('/albums/'+id);
  }

  goToTag(id){
    this.router.navigateByUrl('/tags/'+id);
 }

  gotToPeople(id){
    this.router.navigateByUrl('/peoples/'+id);
  }

  triPriseDeVueAncienRecent(){
    this.catService.curPhotos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    });
    this.catService.curVideos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    });
    this.triMode = false;
  }

  triPriseDeVueRecentAncien(){
    this.catService.curPhotos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return 0;
    });
    this.catService.curVideos.sort((a,b) => {
      let dateA = new Date(a.shootDate), dateB = new Date(b.shootDate);
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      return 0;
    });
    this.triMode = false;
  }

  triAZ(){
    this.catService.curPhotos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
    this.catService.curVideos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
    this.triMode = false;
  }

  triZA(){
    this.catService.curPhotos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return 1;
      if (titleA > titleB) return -1;
      return 0;
    });
    this.catService.curVideos.sort((a,b) => {
      let titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase();
      if (titleA < titleB) return 1;
      if (titleA > titleB) return -1;
      return 0;
    });
    this.triMode = false;
  }

  toEditMode(){
    this.editMode = true;
    this.selectedPhotos = this.catService.curPhotos;
    this.selectedPhotos.forEach(photo => photo.isSelected = false);
    this.selectedPhotos.forEach(photo => photo.deleteMode = false);
    this.selectedVideos = this.catService.curVideos;
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

  toDeletMultipleMode(){
    this.deleteMultipleMode = true;
  }

  cancelDeletMultipleMode(){
    this.deleteMultipleMode = false;
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
    this.nbSelectedItem = 0;
    this.nbSelectedItem += this.selectedPhotos.reduce((a, photo)=> {return photo.isSelected?a+1:a;} ,0);
    this.nbSelectedItem += this.selectedVideos.reduce((a, video)=> {return video.isSelected?a+1:a;} ,0);
  }

  isAllSelected() {
    this.masterSelected = this.selectedPhotos.every(function(item:any) {
        return item.isSelected == true;
    }) && this.selectedVideos.every(function(item:any) {
      return item.isSelected == true;
    });
    this.nbSelectedItem = 0;
    this.nbSelectedItem += this.selectedPhotos.reduce((a, photo)=> {return photo.isSelected?a+1:a;} ,0);
    this.nbSelectedItem += this.selectedVideos.reduce((a, video)=> {return video.isSelected?a+1:a;} ,0);
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

  deleteMultiple(){
    this.selectedPhotos.forEach( p =>{
      if(p.isSelected)
        this.deleteConfPhoto(p);
    });
    this.cancelDeletMultipleMode();
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

  setSelectedAlbumToCopy(idAlbum){
    this.selectedAlbumToCopyPhoto = idAlbum;
  }

  setCover(photo){
    this.route.pathFromRoot[1].url.pipe(first()).subscribe( val => {
      this.apiService.putCover(this.catService.curCat, photo, val[0].path).subscribe(
        {
          next: album => {
            this.catService.setCover(photo);
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
          this.catService.setCover(null);
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

  toTimeMode(){
    this.timeMode = true;
    this.curYear = 0;
    this.curMonth = 0;
    this.curDay = 0;
    this.curTimeLevel = "YEAR";
    this.catService.cancelFilter();
    this.catService.getYears();
    this.prevYear = 0;
    this.nextYear = 0;
    this.prevMonth = 0;
    this.nextMonth = 0;
    this.prevDay = 0;
    this.nextDay = 0;
  }

  cancelTimeMode(){
    this.timeMode = false;
    this.catService.cancelFilter();
    if(this.editMode){
      this.toEditMode();
    }
  }


  goToYear(year){
    this.curYear = year;
    this.catService.filterYears(year);
    this.curTimeLevel = "MONTH";
    let indexCurrentYear = this.catService.timeYears.indexOf(year);
    if (indexCurrentYear > 0){
      this.prevYear = this.catService.timeYears[indexCurrentYear -1];
    }
    else{
      this.prevYear = 0;
    }
    if (indexCurrentYear + 1  < this.catService.timeYears.length){
      this.nextYear = this.catService.timeYears[indexCurrentYear + 1];
    }
    else{
      this.nextYear = 0;
    }
    if(this.editMode){
      this.toEditMode();
    }
  }

  goToMonth(year, month){
    this.catService.filterMonth(year, month);
    this.curYear = year;
    this.curMonth = month;
    this.curTimeLevel = "DAY";

    let indexCurrentMonth = this.catService.timeMonths.findIndex( d=> d.y === year && d.m === month);
    if (indexCurrentMonth > 0){
      this.prevYear = this.catService.timeMonths[indexCurrentMonth -1].y;
      this.prevMonth = this.catService.timeMonths[indexCurrentMonth -1].m;
    }
    else{
      this.prevYear = 0;
    }
    if (indexCurrentMonth + 1 < this.catService.timeMonths.length){
      this.nextYear = this.catService.timeMonths[indexCurrentMonth + 1].y;
      this.nextMonth = this.catService.timeMonths[indexCurrentMonth + 1].m;
    }
    else{
      this.nextYear = 0;
    }
    if(this.editMode){
      this.toEditMode();
    }
  }

  goToDay(year, month, day){
    this.catService.filterDay(year, month, day);
    this.curYear = year;
    this.curMonth = month;
    this.curDay = day;
    this.curTimeLevel = "DAY-SELECT";

    let indexCurrentMonth = this.catService.timeDays.findIndex( d=> d.y === year && d.m === month && d.d === day);
    if (indexCurrentMonth > 0){
      this.prevYear = this.catService.timeDays[indexCurrentMonth -1].y;
      this.prevMonth = this.catService.timeDays[indexCurrentMonth -1].m;
      this.prevDay = this.catService.timeDays[indexCurrentMonth -1].d;
    }
    else{
      this.prevYear = 0;
    }
    if (indexCurrentMonth + 1 < this.catService.timeDays.length){
      this.nextYear = this.catService.timeDays[indexCurrentMonth + 1].y;
      this.nextMonth = this.catService.timeDays[indexCurrentMonth + 1].m;
      this.nextDay = this.catService.timeDays[indexCurrentMonth + 1].d;
    }
    else{
      this.nextYear = 0;
    }
    if(this.editMode){
      this.toEditMode();
    }
  }

  rotateLeft(){
    this.selectedPhotos.forEach( p =>{
      if(p.isSelected)
      this.apiService.rotateLeft(p).subscribe(
        {
          next: data => {
            data.srcOrig+="?" + new Date().getTime();
            data.src150+="?" + new Date().getTime();
            data.src320+="?" + new Date().getTime();
            data.src640+="?" + new Date().getTime();
            data.src1280+="?" + new Date().getTime();
            data.src1920+="?" + new Date().getTime();
            data.shootDate = p.shootDate;
            this.selectedPhotos[this.selectedPhotos.findIndex(ph => ph.idPhoto === data.idPhoto)] = { ...this.selectedPhotos[this.selectedPhotos.findIndex(ph => ph.idPhoto === data.idPhoto)], ...data};
            this.catService.updatePhoto(data);
            this.toast.success(data.title,
              'Enregistré',
              {timeOut: 3000,});
          },
          error: error => {
            this.toast.error(p.title,
            'Echec de la modification',
            {timeOut: 4000,});
            console.error('There was an error in rotation!', error);
          }
      });
    });
  }

  rotateRight(){
    this.selectedPhotos.forEach( p =>{
      if(p.isSelected)
      this.apiService.rotateRight(p).subscribe(
        {
          next: data => {
            data.srcOrig+="?" + new Date().getTime();
            data.src150+="?" + new Date().getTime();
            data.src320+="?" + new Date().getTime();
            data.src640+="?" + new Date().getTime();
            data.src1280+="?" + new Date().getTime();
            data.src1920+="?" + new Date().getTime();
            data.shootDate = p.shootDate;
            this.selectedPhotos[this.selectedPhotos.findIndex(ph => ph.idPhoto === data.idPhoto)] = { ...this.selectedPhotos[this.selectedPhotos.findIndex(ph => ph.idPhoto === data.idPhoto)], ...data};
            this.catService.updatePhoto(data);
            this.toast.success(data.title,
              'Enregistré',
              {timeOut: 3000,});
          },
          error: error => {
            this.toast.error(p.title,
            'Echec de la modification',
            {timeOut: 4000,});
            console.error('There was an error in rotation!', error);
          }
      });
    });
  }

  moveToAlbum(){
    this.selectedPhotos.forEach( p =>{
      if(p.isSelected)
      this.apiService.putMovePhotoToAlbum(p.idPhoto, this.selectedAlbumToMovePhoto).subscribe(
        {
          next: data => {
            this.catService.deletePhoto(data.idPhoto);
            this.selectedPhotos.splice(this.selectedPhotos.findIndex(ph => ph.idPhoto === data.idPhoto),1);
            this.toast.success(data.title,
              'Déplacé',
              {timeOut: 3000,});
          },
          error: error => {
            this.toast.error(p.title,
            'Echec du déplacement',
            {timeOut: 4000,});
            console.error('There was an error in moving photo!', error);
          }
      });
    });
  }

  copyToAlbum(){
    this.selectedPhotos.forEach( p =>{
      if(p.isSelected)
      this.apiService.putCopyPhotoToAlbum(p.idPhoto, this.selectedAlbumToCopyPhoto).subscribe(
        {
          next: data => {
            data.shootDate = p.shootDate;
            this.catService.updatePhoto(data);
            this.toast.success(data.title,
              'Copié',
              {timeOut: 3000,});
          },
          error: error => {
            this.toast.error(p.title,
            'Echec de la copie',
            {timeOut: 4000,});
            console.error('There was an error in moving photo!', error);
          }
      });
    });
  }

}
