import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { AlbumModel } from '../models/album.model';
import { PhotoModel } from '../models/photo.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {

  albumCache: AlbumModel;
  currentAlbum: AlbumModel;
  parentList: Array<any>;
  currentPhoto: PhotoModel;
  prevPhoto: PhotoModel;
  nextPhoto:PhotoModel;
  idPhotoToLoad: number;

  constructor(private apiService: ApiService) {
    this.idPhotoToLoad = 0;
    this.albumCache = {id: 0, title: "Acceuil", description : "Bienvenu sur l'album photo", listAlbum : []}
  }

  /**
   * Charge l'album donné
   * @param id idAlbum
   */
  async loadAlbum(id){
    // On regarde si l'album est en cache
    if (id === 0){
      console.log("ALERT CHARGEMENT RACINE")
    }
    // algo récursive pour vérifier la présence de l'album en cache, du coverPhoto et des photos
    // si trouvé -> on le charge dans le currentAlbum, on fait le checksum et on le compare avec celui du serveur
    // si différent on charge l'album qui a été modifié et on met à jour le cache

    // si pas encore dans le cache
    // On renvoie l'album avec la photo de couverture et les photos
    this.apiService.getAlbumWithPhotos(id).subscribe(album => {
      this.currentAlbum = album;
      if (this.idPhotoToLoad){
        this.currentPhoto = this.currentAlbum.photos.find(photo => photo.idPhoto === this.idPhotoToLoad);
        this.getNextPrevPhoto(this.currentPhoto);
        this.idPhotoToLoad = 0;
      }
      this.apiService.getSSAlbums(id).subscribe(liste => {
        this.currentAlbum.listAlbum = liste.children;

        // let observables = this.currentAlbum.listAlbum.map(ssAlbum => this.apiService.getAlbumWithPhotos(ssAlbum.id));

        // from(this.currentAlbum.listAlbum)
        // .pipe(
        // map(ssAlbum => this.apiService.getAlbumWithPhotos(ssAlbum.id)),

        // )
        // .subscribe(x => console.log(x));
        // // forkJoin the array/collection of observables



        this.currentAlbum.listAlbum.forEach((ssAlbum, i) =>
          this.apiService.getAlbumWithPhotos(ssAlbum.id).subscribe( ssAlbumWithCoverAndPhoto =>
            this.currentAlbum.listAlbum[i] = ssAlbumWithCoverAndPhoto));
        this.parentList = [];
        // On met à jour la liste des parents et on le ratache au cache
        this.apiService.getAlbumParents(id).subscribe(parents => this.buildParentTree(parents,this.currentAlbum));
      });
    });
  }

  buildParentTree(tree, currentAlbum){
    if (tree.parent){
      if (currentAlbum.id === tree.id){
        this.parentList.push({id : tree.parent.id, title : tree.parent.title});
        let albumParent: AlbumModel = {id: tree.parent.id, title : tree.parent.title, description : tree.parent.description};
        albumParent.listAlbum = currentAlbum;
        this.buildParentTree(tree.parent,albumParent);
      }
      else{
        console.log("Error logic");
      }
    }
    // On ratache à la racine
    let indexAlbum = this.albumCache.listAlbum.findIndex(a => a.id === currentAlbum.id)
    if (indexAlbum !== -1){
      this.albumCache.listAlbum[indexAlbum] = currentAlbum;
    }
    else{
      this.albumCache.listAlbum.push(currentAlbum);
    }
  }

  loadRoot(){
    // algo récursive pour vérifier la présence de l'album en cache, du coverPhoto et des photos
    // si trouvé -> on le charge dans le currentAlbum, on fait le checksum et on le compare avec celui du serveur
    // si différent on charge l'album qui a été modifié et on met à jour le cache

    // si pas encore dans le cache
    // On renvoie l'album avec la photo de couverture et les photos
    this.apiService.getRootsAlbums().subscribe(albums => { console.log(albums);
      this.albumCache.listAlbum = albums ;
      this.currentAlbum = this.albumCache;
    });
  }

  moveNextPhoto(){
    if(this.nextPhoto){
      this.currentPhoto = this.nextPhoto;
      this.getNextPrevPhoto(this.currentPhoto);
    }
  }

  movePrevPhoto(){
    if(this.prevPhoto){
      this.currentPhoto = this.prevPhoto;
      this.getNextPrevPhoto(this.currentPhoto);
    }
  }

  loadPhoto(photo: PhotoModel){
    console.log(photo);
    this.currentPhoto = photo;
    this.getNextPrevPhoto(photo);
  }

  loadPhotoFromId(idPhoto){
    if (!this.currentAlbum){
      this.idPhotoToLoad = idPhoto;
    }
    else{
      this.currentPhoto = this.currentAlbum.photos.find(photo => photo.idPhoto === idPhoto);
      this.getNextPrevPhoto(this.currentPhoto);
    }
  }

  returnGalery(){
    this.currentPhoto = null;
    this.nextPhoto = null;
    this.prevPhoto = null;
  }

  getNextPrevPhoto(photo: PhotoModel){
    let currentPosition = this.currentAlbum.photos.indexOf(photo);
    if (currentPosition < this.currentAlbum.photos.length){
      this.nextPhoto = this.currentAlbum.photos[currentPosition + 1];
    }
    else{
      this.nextPhoto = null;
    }
    if (currentPosition > 0){
      this.prevPhoto = this.currentAlbum.photos[currentPosition - 1];
    }
    else{
      this.prevPhoto = null;
    }
  }



}
