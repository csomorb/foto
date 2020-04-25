import { Injectable } from '@angular/core';
import { PhotoModel } from './models/photo.model';
import { TagModel } from './models/tag.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  getPhoto(id:number){
    let photo: PhotoModel;
    photo.title = "Titre photo";
    photo.descr = "Description de la photo";
    photo.listTag = new Array<TagModel>();
    photo.src1280x720 = "";
    photo.src150x150 = "";
    photo.src1920x1080 = "";
    photo.src320x240 = "";
    photo.src640x480 = "";
    photo.srcOrig = "";
    photo.addDate = new Date();
    photo.creatDate = new Date();

    return photo;
  }
}
