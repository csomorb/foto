import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { PhotoModel } from 'src/app/models/photo.model';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators'
import { ItemModel } from 'src/app/models/item.model';

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
  selectedItems: Array<any>;
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
  nbItemPerPage: number;
  currentPage: number;

  constructor(public router: Router, public catService: CategoryService, public apiService: ApiService,public toast: ToastrService, public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.editMode = false;
    this.deleteMode = false;
    this.triMode = false;
    this.addMode = false;
    this.timeMode = false;
    this.selectedItems = [];
    this.nbItemPerPage = 40;

     if (this.catService.curItem){
      let index = 0;
      if(this.catService.curItem.idPhoto)
        index = this.catService.curItems.findIndex(p => p.idPhoto === this.catService.curItem.idPhoto);
      if(this.catService.curItem.idVideo)
        index = this.catService.curItems.findIndex(v => v.idVideo === this.catService.curItem.idVideo);
      this.currentPage =  ( index - index % this.nbItemPerPage ) / this.nbItemPerPage + 1;
      this.catService.curItem = null;
     }
     else{
      this.currentPage = 1;
     }

    this.catService.selectedCoordinates.subscribe( coord => {
      if (this.editMode && this.nbSelectedItem){
        this.selectedItems.forEach( i =>{
          if(i.isSelected){
            i.long = coord[0];
            i.lat = coord[1];
            if(i.idPhoto)
            this.apiService.putPhoto(i).subscribe(
              {
                next: data => {
                  data.shootDate = i.shootDate;
                  this.catService.geoTagMode = false;
                  this.selectedItems[this.selectedItems.findIndex(ph => ph.idPhoto === data.idPhoto)] = { ...this.selectedItems[this.selectedItems.findIndex(ph => ph.idPhoto === data.idPhoto)], ...data};
                  this.catService.updatePhoto(data);
                  this.toast.success(data.title,
                    'Enregistré',
                    {timeOut: 3000,});
                },
                error: error => {
                  this.toast.error(i.title,
                  'Echec de la modification',
                  {timeOut: 4000,});
                  console.error('There was an error in rotation!', error);
                }
            });
            if(i.idVideo)
            this.apiService.putVideo(i).subscribe(
              {
                next: data => {
                  data.shootDate = i.shootDate;
                  this.catService.geoTagMode = false;
                  this.selectedItems[this.selectedItems.findIndex(v => v.idVideo === data.idVideo)] = { ...this.selectedItems[this.selectedItems.findIndex(v => v.idVideo === data.idVideo)], ...data};
                  this.catService.updateVideo(data);
                  this.toast.success(data.title,
                    'Enregistré',
                    {timeOut: 3000,});
                },
                error: error => {
                  this.toast.error(i.title,
                  'Echec de la modification',
                  {timeOut: 4000,});
                  console.error('There was an error in rotation!', error);
                }
            });
          }
        });
      }
    });

  }

  loadItem(item: ItemModel){
    this.catService.loadItem(item);
    if (item.idPhoto){
      this.route.pathFromRoot[1].url.pipe(first()).subscribe( val => this.router.navigateByUrl('/'+val[0].path+'/'+this.catService.curCat.id +'/photos/' + item.idPhoto));
    }
    else if(item.idVideo){
      this.route.pathFromRoot[1].url.pipe(first()).subscribe( val => this.router.navigateByUrl('/'+val[0].path+'/'+this.catService.curCat.id +'/videos/' + item.idVideo));
    }
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
    this.catService.triPriseDeVueAncienRecent();
    this.triMode = false;
  }

  triPriseDeVueRecentAncien(){
    this.catService.triPriseDeVueRecentAncien();
    this.triMode = false;
  }

  triAZ(){
    this.catService.triAZ();
    this.triMode = false;
  }

  triZA(){
    this.catService.triZA();
    this.triMode = false;
  }


  toEditMode(){
    this.editMode = true;
    this.selectedItems = this.catService.curItems;
    this.selectedItems.forEach(i => {i.isSelected = false; i.deleteMode = false});
    this.nbSelectedItem = 0;
  }

  cancelEditMode(){
    this.editMode = false;
    this.cancelGeoMode();
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
    for (var i = 0; i < this.selectedItems.length; i++) {
      this.selectedItems[i].isSelected = this.masterSelected;
    }
    this.nbSelectedItem += this.selectedItems.reduce((a, i)=> {return i.isSelected?a+1:a;} ,0);
  }

  isAllSelected() {
    this.masterSelected = this.selectedItems.every(function(item:any) {
        return item.isSelected == true;
    });
    this.nbSelectedItem += this.selectedItems.reduce((a, i)=> {return i.isSelected?a+1:a;} ,0);
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
    this.selectedItems.forEach( p =>{
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
    this.currentPage = 1;
    this.timeMode = true;
    this.curYear = 0;
    this.curMonth = 0;
    this.curDay = 0;
    this.curTimeLevel = "YEAR";
    this.prevYear = 0;
    this.nextYear = 0;
    this.prevMonth = 0;
    this.nextMonth = 0;
    this.prevDay = 0;
    this.nextDay = 0;
    this.catService.cancelFilter();
    this.catService.getYears();
  }

  toAllYears(){
    this.currentPage = 1;
    this.curTimeLevel = "YEAR";
    this.curYear = 0;
    this.curMonth = 0;
    this.curDay = 0;
    this.prevYear = 0;
    this.nextYear = 0;
    this.prevMonth = 0;
    this.nextMonth = 0;
    this.prevDay = 0;
    this.nextDay = 0;
    this.catService.cancelFilter();
  }

  cancelTimeMode(){
    this.currentPage = 1;
    this.timeMode = false;
    this.catService.cancelFilter();
    if(this.editMode){
      this.toEditMode();
    }
  }


  goToYear(year){
    this.currentPage = 1;
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
    this.currentPage = 1;
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
    this.currentPage = 1;
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
    this.selectedItems.forEach( p =>{
      if(p.isSelected && p.idPhoto)
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
            this.selectedItems[this.selectedItems.findIndex(ph => ph.idPhoto === data.idPhoto)] = { ...this.selectedItems[this.selectedItems.findIndex(ph => ph.idPhoto === data.idPhoto)], ...data};
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
    this.selectedItems.forEach( p =>{
      if(p.isSelected && p.idPhoto)
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
            this.selectedItems[this.selectedItems.findIndex(ph => ph.idPhoto === data.idPhoto)] = { ...this.selectedItems[this.selectedItems.findIndex(ph => ph.idPhoto === data.idPhoto)], ...data};
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
    this.selectedItems.forEach( p =>{
      if(p.isSelected && p.idPhoto)
      this.apiService.putMovePhotoToAlbum(p.idPhoto, this.selectedAlbumToMovePhoto).subscribe(
        {
          next: data => {
            this.catService.deletePhoto(data.idPhoto);
            this.selectedItems.splice(this.selectedItems.findIndex(ph => ph.idPhoto === data.idPhoto),1);
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
      if(p.isSelected && p.idVideo)
      this.apiService.putMoveVideoToAlbum(p.idVideo, this.selectedAlbumToMovePhoto).subscribe(
        {
          next: data => {
            this.catService.deleteVideo(data.idVideo);
            this.selectedItems.splice(this.selectedItems.findIndex(v => v.idVideo === data.idVideo),1);
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
    this.selectedItems.forEach( p =>{
      if(p.isSelected && p.idPhoto)
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
      if(p.isSelected && p.idVideo)
      this.apiService.putCopyVideoToAlbum(p.idVideo, this.selectedAlbumToCopyPhoto).subscribe(
        {
          next: data => {
            data.shootDate = p.shootDate;
            this.catService.updateVideo(data);
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

  cancelGeoMode(){
    this.catService.geoTagMode = false;
  }

  toGeoMode(){
    this.catService.geoTagMode = true;
  }

  goToPage(pageNumber: number){
    this.currentPage = pageNumber;
  }

}
