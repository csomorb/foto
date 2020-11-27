import { Component, OnInit, Input, HostListener } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PhotoModel } from 'src/app/models/photo.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from 'src/app/services/category.service';
import { first } from 'rxjs/operators'

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
  tagMode:boolean;
  facetracker;
  facelist:Array<any>; //{total: 1, width: 39, height: 39, x: 195, y: 624}


  constructor(public catService: CategoryService, private router: Router,
    private location: Location, private route: ActivatedRoute, private apiService: ApiService,
    private toast: ToastrService) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const idPhoto = parseInt(params.get('idPhoto'));
      this.catService.loadPhotoFromId(idPhoto);
      // setTimeout( () => console.log("wait to load children"), 500);
    });
    this.tagMode = false;
    this.editMode = false;
    this.editMode = false;
    this.facelist = [];

    this.catService.selectedCoordinates.subscribe( coord => {
      console.log(coord);
      this.catService.curPhoto.long = coord[0];
      this.catService.curPhoto.lat = coord[1];
      this.apiService.putPhoto(this.catService.curPhoto).subscribe(
        {
          next: data => {
            data.shootDate = this.catService.curPhoto.shootDate;
            this.catService.geoTagMode = false;
            this.catService.updatePhoto(data);
            this.toast.success(data.title,
              'Enregistré',
              {timeOut: 3000,});
          },
          error: error => {
            this.toast.error(this.catService.curPhoto.title,
            'Echec de la modification',
            {timeOut: 4000,});
            console.error('There was an error in rotation!', error);
          }
      });
    });
  }

  moveNextPhoto(){
    let previousPhotoId = this.catService.curPhoto.idPhoto;
    this.catService.moveNextPhoto();
    let cururl = this.location.path().replace( "photos/"+previousPhotoId, "photos/" + this.catService.curPhoto.idPhoto );
    this.location.go(cururl);
    this.photo = this.catService.curPhoto;
    this.tagMode = false;
  }

  setSelectedFace(e,f){
    console.log("POST FACETAG");
    this.apiService.postFace(this.catService.curPhoto.idPhoto,e,f.x,f.y,f.h,f.w).subscribe(
      {
        next: res => {
          console.log(res);
          this.catService.curPhoto.faces.push(res);
          this.catService.curPhoto.facesToTag.splice(this.catService.curPhoto.facesToTag.findIndex(t => t.x === f.x && t.y === f.y),1);
          // this.catService.curPhoto.listPeople.push(res.people);
          // TODO à modifier
          this.catService.updatePhoto(this.catService.curPhoto);

          this.toast.success( res.people.title,
            'Enregistré',
            {timeOut: 3000,});
        },
        error: error => {
          this.toast.error('Non enregistré',
          'Echec de la modification',
          {timeOut: 4000,});
          console.error('There was an error in seting cover!', error);
        }
    });
    console.log(e);
    console.log(f);
    // TODO: mise à jour du list people et passage
  }

  movePrevPhoto(){
    let previousPhotoId = this.catService.curPhoto.idPhoto;
    this.catService.movePrevPhoto();
    let cururl = this.location.path().replace( "photos/"+previousPhotoId, "photos/" + this.catService.curPhoto.idPhoto );
    this.location.go(cururl);
    this.photo = this.catService.curPhoto;
    this.tagMode = false;
  }

  gotToPeople(idPeople){
    this.router.navigateByUrl("peoples/" + idPeople);
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
    this.catService.returnGalery();
    this.route.pathFromRoot[1].url.pipe(first()).subscribe( val => this.router.navigateByUrl('/'+val[0].path+'/'+this.catService.curCat.id));
  }

  toEditMode(){
    this.editMode = true;
    this.photo = {...this.catService.curPhoto};
  }

  cancelEditMode(){
    this.editMode = false;
  }

  updatePhoto(){
    this.apiService.putPhoto(this.photo).subscribe( photo =>{
      this.catService.updatePhoto(photo);
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

  showTagedFace(idPeople){
    this.catService.curPhoto.faces[this.catService.curPhoto.faces.findIndex(p => p.idPeople === idPeople)].show = true;
  }

  hideTagedFace(idPeople){
    this.catService.curPhoto.faces[this.catService.curPhoto.faces.findIndex(p => p.idPeople === idPeople)].show = false;
  }

  cancelGeoMode(){
    this.catService.geoTagMode = false;
  }

  toGeoMode(){
    this.catService.geoTagMode = true;
  }


  toDeleteMode(){
    this.deleteMode = true;
  }

  cancelDeleteMode(){
    this.deleteMode = false;
  }

  toTagMode(){
    this.tagMode = true;
  }

  cancelTagMode(){
    this.tagMode = false;
  }

  rotateLeft(){
    this.apiService.rotateLeft(this.catService.curPhoto).subscribe(
      {
        next: data => {
          data.srcOrig+="?" + new Date().getTime();
          data.src150+="?" + new Date().getTime();
          data.src320+="?" + new Date().getTime();
          data.src640+="?" + new Date().getTime();
          data.src1280+="?" + new Date().getTime();
          data.src1920+="?" + new Date().getTime();
          data.shootDate = this.catService.curPhoto.shootDate;
          this.catService.updatePhoto(data);
          this.toast.success(data.title,
            'Enregistré',
            {timeOut: 3000,});
        },
        error: error => {
          this.toast.error(this.catService.curPhoto.title,
          'Echec de la modification',
          {timeOut: 4000,});
          console.error('There was an error in rotation!', error);
        }
    });
  }

  rotateRight(){
    this.apiService.rotateRight(this.catService.curPhoto).subscribe(
      {
        next: data => {
          data.srcOrig+="?" + new Date().getTime();
          data.src150+="?" + new Date().getTime();
          data.src320+="?" + new Date().getTime();
          data.src640+="?" + new Date().getTime();
          data.src1280+="?" + new Date().getTime();
          data.src1920+="?" + new Date().getTime();
          data.shootDate = this.catService.curPhoto.shootDate;
          this.catService.updatePhoto(data);
          this.toast.success(data.title,
            'Enregistré',
            {timeOut: 3000,});
        },
        error: error => {
          this.toast.error(this.catService.curPhoto.title,
          'Echec de la modification',
          {timeOut: 4000,});
          console.error('There was an error in rotation!', error);
        }
    });
  }

  deletePhoto(){
    this.apiService.deletePhoto(this.catService.curPhoto).subscribe(
      {
        next: data => {
          let previousPhotoId = this.catService.curPhoto.idPhoto;
          const photoTitle = this.catService.curPhoto.title;
          this.catService.deleteCurrentPhoto();
          let cururl = this.location.path().replace( "photos/"+previousPhotoId, "photos/" + this.catService.curPhoto.idPhoto );
          this.location.go(cururl);
          this.photo = this.catService.curPhoto;
          this.deleteMode = false;
          this.toast.success(photoTitle,
            'Photo supprimé',
            {timeOut: 3000,});
          if (this.catService.curPhotos.length === 0){
            this.returnGalery();
          }
        },
        error: error => {
          this.toast.error(this.catService.curPhoto.title,
          'Echec de la suppression',
          {timeOut: 4000,});
          console.error('There was an error in delete!', error);
        }
    });
  }

  setCover(){
    this.route.pathFromRoot[1].url.pipe(first()).subscribe( val => {
      this.apiService.putCover(this.catService.curCat, this.catService.curPhoto, val[0].path).subscribe(
        {
          next: cat => {
            this.catService.curCat.coverPhoto = this.catService.curPhoto;
            this.toast.success( this.catService.curPhoto.title,
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

  unsetCover(){
    this.route.pathFromRoot[1].url.pipe(first()).subscribe( val => {
      this.apiService.putNoCover(this.catService.curCat, val[0].path).subscribe(
      {
        next: cat => {
          this.catService.curCat.coverPhoto = null;
          this.toast.success( this.catService.curPhoto.title,
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
