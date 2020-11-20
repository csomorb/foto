import { Component, OnInit, Input, HostListener } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PhotoModel } from 'src/app/models/photo.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from 'src/app/services/category.service';
import { first } from 'rxjs/operators'
declare const faceapi: any;

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
 //   console.log(faceapi);
    this.facelist = [];
  //  faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/face');
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



  async face(image, canvas){
    image.crossOrigin = "Anonymous";
    const displaySize = { width: image.width, height: image.height }
    console.log(image);
    console.log("debut");
    const detections = await faceapi.detectAllFaces(image);
    console.log(detections[0].relativeBox);
    detections.forEach( el => {
      console.log(image.width);
      console.log(el);
      console.log(el.x);
      let facePosition = {
        x: (el.relativeBox.x  * image.width),
        y: (el.relativeBox.y  * image.height),
        h: el.relativeBox.height * image.height,
        w: el.relativeBox.width  * image.width
      };
      console.log(facePosition);
      this.facelist.push(facePosition);
    });
    faceapi.matchDimensions(canvas, displaySize);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    console.log(resizedDetections);
    // draw detections into the canvas
    faceapi.draw.drawDetections(canvas, resizedDetections)

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
          if (this.catService.curCat.photos.length === 0){
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
    this.apiService.putCover(this.catService.curCat, this.catService.curPhoto).subscribe(
      {
        next: album => {
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
  }

  unsetCover(){
    this.apiService.putNoCover(this.catService.curCat).subscribe(
      {
        next: album => {
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
  }

}
