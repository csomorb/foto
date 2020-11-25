import { Injectable } from '@angular/core';
import { AlbumModel } from '../models/album.model';
import { CategoryModel } from '../models/category.model';
import { PeopleModel } from '../models/people.model';
import { PhotoModel } from '../models/photo.model';
import { TagModel } from '../models/tag.model';
import { VideoModel } from '../models/video.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  /**
   * Current category
   */
  curCat: AlbumModel | PeopleModel | TagModel | CategoryModel;

  curPhotos: Array<PhotoModel>;
  curVideos: Array<VideoModel>;

  timeYears: Array<number>;
  timeMonths: Array<any>;
  timeDays: Array<any>;
  /**
   * Current photo
   */
  curPhoto: PhotoModel;
  prevPhoto: PhotoModel;
  nextPhoto: PhotoModel;
  idPhotoToLoad: number;
  curVideo: VideoModel;
  prevVideo: VideoModel;
  nextVideo: VideoModel;
  idVideoToLoad: number;
  parentList: Array<any>;
  peopleList: Array<PeopleModel>;
  tagList: Array<TagModel>;

  constructor(private apiService: ApiService) {
    this.idPhotoToLoad = 0;
    this.idVideoToLoad = 0;
    this.apiService.getPeoples().subscribe( p => this.peopleList = p);
    this.apiService.getTags().subscribe( t => this.tagList = t);
  }

  /**
   * Charge toutes les personnes
   */
  loadRootPeople(){
    this.curCat = {id: 0, title: "Personnes", description : "Liste des personnes taguées", listPeople : []} as CategoryModel;
    this.parentList = [];
    this.apiService.getRootsPeoples().subscribe(peoples => { console.log(peoples);
      this.curCat.listPeople = peoples;

    });
    this.curCat.videos = [];
    this.curCat.photos = [];
    this.curPhotos = [...this.curCat.photos];
    this.curVideos = [...this.curCat.videos];
  }

  /**
   * Charge la personne donnée
   * @param idPeople
   */
  loadPeople(idPeople){
    if (idPeople === 0){
      console.error("Chargement racine people logic error")
    }
    this.apiService.getPeopleWithPhotos(idPeople).subscribe(people => {
      console.log(people);
      this.curCat = people;

      this.curCat.photos = [];
      this.curCat.listAlbum = [];
      this.curCat.faces.forEach(f =>{
        this.curCat.photos.push(f.photo);
        // f.photo.albums.forEach(al => {
        //   // utile???? -> non je ne crois pas
        //   if (this.curCat.listAlbum.findIndex(a => a.id === al.id) === -1){
        //     this.curCat.listAlbum.push(al);
        //   }
        // });
      });

      this.curCat.listPeople = [];
      this.curCat.photos.forEach(p =>{
        p.shootDate = new Date(p.shootDate);
        p.peoples = [];
        p.faces.forEach(f => {
          f.show = false;
          p.peoples.push(this.peopleList.find( s => s.id === f.idPeople));
          // if (this.curCat.listPeople.findIndex(s => s.id === f.idPeople) === -1){
          //   this.curCat.listPeople.push(this.peopleList.find( s => s.id === f.idPeople));
          // }
        });
      });
      this.parentList = [];
      this.curCat.videos = [];
      this.curPhotos = [...this.curCat.photos];
      this.curVideos = [...this.curCat.videos];
      this._loadPhotoVideoAfterInit();
    });

  }

  /**
   * Charge l'album donné
   * @param id idAlbum
   */
  loadAlbum(id){
    if (id === 0){
      console.error("Chargement racine logic error")
    }
    this.apiService.getAlbumWithPhotos(id).subscribe(album => {
      this.curCat = album;
      this.curCat.listPeople = [];
      this.curCat.photos.forEach(p =>{
        p.shootDate = new Date(p.shootDate);
        p.peoples = [];
        p.faces.forEach(f => {
          f.show = false;
          p.peoples.push(this.peopleList.find( s => s.id === f.idPeople));
          if (this.curCat.listPeople.findIndex(s => s.id === f.idPeople) === -1){
            this.curCat.listPeople.push(this.peopleList.find( s => s.id === f.idPeople));
          }
        });
      });

      this.apiService.getSSAlbums(id).subscribe(liste => {
        this.curCat.listAlbum = liste.children;
        this.curCat.listAlbum.forEach((ssAlbum, i) =>
          this.apiService.getAlbumWithPhotos(ssAlbum.id).subscribe( ssAlbumWithCoverAndPhoto =>
            this.curCat.listAlbum[i] = ssAlbumWithCoverAndPhoto));
        this.parentList = [];
        // On met à jour la liste des parents
        this.apiService.getAlbumParents(id).subscribe(parents => {
          this._buildParentTree(parents,this.curCat);
          //this.parentList.unshift({ id :'', title: 'Acceuil'});
        });
      });
      this.curCat.videos = [];
      this.curPhotos = [...this.curCat.photos];
      this.curVideos = [...this.curCat.videos];
      this._loadPhotoVideoAfterInit();
    });
  }

  /**
   * Charge les albums à la racine
   */
  loadRootAlbum(){
    this.curCat = {id: 0, title: "Acceuil", description : "Bienvenu sur l'album photo", listAlbum : []} as CategoryModel;
    this.parentList = [];
    this.apiService.getRootsAlbums().subscribe(albums => { console.log(albums);
      this.curCat.listAlbum = albums;
      this.curPhotos = [];
      this.curVideos = [];
    });
  }

  /**
   * Pass à la vidéo suivante si disponible
   */
  moveNextVideo(){
    if(this.nextVideo){
      this.curVideo = this.nextVideo;
      this._getNextPrevVideo(this.curVideo);
    }
  }

  /**
   * Pass à la vidéo précédente si disponible
   */
  movePrevVideo(){
    if(this.prevVideo){
      this.curVideo = this.prevVideo;
      this._getNextPrevVideo(this.curVideo);
    }
  }

  /**
   * Pass à la photo suivante si disponible
   */
  moveNextPhoto(){
    if(this.nextPhoto){
      this.curPhoto = this.nextPhoto;
      this._getNextPrevPhoto(this.curPhoto);
    }
  }

  /**
   * Pass à la photo précédente si disponible
   */
  movePrevPhoto(){
    if(this.prevPhoto){
      this.curPhoto = this.prevPhoto;
      this._getNextPrevPhoto(this.curPhoto);
    }
  }

  /**
   * Met à jour une vidéo dans la catégorie suite à un changement en bdd
   * @param video Vidéo avec les champs mise à jour
   */
  updateVideo(updatedVideo: VideoModel){
    this.curVideo = updatedVideo;
    this.curCat.videos.forEach( video => {
      if (video.idVideo === updatedVideo.idVideo){
        video = updatedVideo;
      }
    });
    this.curVideos.forEach( video => {
      if (video.idVideo === updatedVideo.idVideo){
        video = updatedVideo;
      }
    });
  }

  /**
   * Met à jour une photo dans la catégorie suite à un changement en bdd
   * @param photo Photo avec les champs mise à jour
   */
  updatePhoto(updatedPhoto: PhotoModel){
    this.curPhoto = updatedPhoto;
    this.curCat.photos.forEach( photo => {
      if (photo.idPhoto === updatedPhoto.idPhoto){
        photo = updatedPhoto;
      }
    });
    this.curPhotos.forEach( photo => {
      if (photo.idPhoto === updatedPhoto.idPhoto){
        photo = updatedPhoto;
      }
    });
  }

  updateCategory(category){
    this.curCat = { ...this.curCat, ...category };
  }

  setCover(photo){
    this.curCat.coverPhoto = photo;
  }

  /**
   * Supprime une vidéo de la catégorie
   * @param idVideoToDelete
   */
  deleteVideo(idVideoToDelete){
    this.curCat.videos.splice(this.curCat.videos.findIndex(video => video.idVideo === idVideoToDelete), 1);
    this.curVideos.splice(this.curVideos.findIndex(video => video.idVideo === idVideoToDelete), 1);
  }

  /**
   * Supprime une photo de la catégorie
   * @param idPhotoToDelete
   */
  deletePhoto(idPhotoToDelete){
    this.curCat.photos.splice(this.curCat.photos.findIndex(photo => photo.idPhoto === idPhotoToDelete), 1);
    this.curPhotos.splice(this.curPhotos.findIndex(photo => photo.idPhoto === idPhotoToDelete), 1);
  }

  /**
   * Supprime la vidéo en cours de visio
   */
  deleteCurrentVideo(){
    const idVideoToDelete = this.curVideo.idVideo;
    let videoToShow: VideoModel = null;
    if (this.nextVideo){
      videoToShow = this.nextVideo;
    }
    else if(this.prevVideo){
      videoToShow = this.prevVideo;
    }
    this.curCat.videos.splice(this.curCat.videos.findIndex(video => video.idVideo === idVideoToDelete), 1);
    this.curVideos.splice(this.curVideos.findIndex(video => video.idVideo === idVideoToDelete), 1);
    if (videoToShow){
      this.curVideo = videoToShow;
      this._getNextPrevVideo(videoToShow);
    }
    else{
      this.curVideo = null;
    }
  }

  /**
   * Supprime la photo en cours de visio
   */
  deleteCurrentPhoto(){
    const idPhotoToDelete = this.curPhoto.idPhoto;
    let photoToShow: PhotoModel = null;
    if (this.nextPhoto){
      photoToShow = this.nextPhoto;
    }
    else if(this.prevPhoto){
      photoToShow = this.prevPhoto;
    }
    this.curCat.photos.splice(this.curCat.photos.findIndex(photo => photo.idPhoto === idPhotoToDelete), 1);
    this.curPhotos.splice(this.curPhotos.findIndex(photo => photo.idPhoto === idPhotoToDelete), 1);
    if (photoToShow){
      this.curPhoto = photoToShow;
      this._getNextPrevPhoto(photoToShow);
    }
    else{
      this.curPhoto = null;
    }
    if (this.curCat.coverPhoto && this.curCat.coverPhoto.idPhoto === idPhotoToDelete){
      if (this.curCat.photos.length > 0){
        this.curCat.coverPhoto = this.curCat.photos[0];
      }
      else{
        this.curCat.coverPhoto = null;
      }
    }
  }

  /**
   * Charge la video donnée
   * @param video
   */
  loadVideo(video: VideoModel){
    this.curVideo = video;
    this._getNextPrevVideo(video);
  }

  /**
   * Charge la vidéo à partir de son id, si la catégorie n'est pas encore chargé, on le charge au chargement de la catégorie
   * @param idVideo
   */
  loadVideoFromId(idVideo){
    if (!this.curVideos){
      this.idVideoToLoad = idVideo;
    }
    else{
      this.curVideo = this.curVideos.find(video => video.idVideo === idVideo);
      this._getNextPrevVideo(this.curVideo);
    }
  }

  /**
   * Charge la photo donnée
   * @param photo
   */
  loadPhoto(photo: PhotoModel){
    this.curPhoto = photo;
    this._getNextPrevPhoto(photo);
  }

  /**
   * Charge la photo à partir de son id, si la catégorie n'est pas encore chargé, on le charge au chargement de la catégorie
   * @param idPhoto
   */
  loadPhotoFromId(idPhoto){
    if (!this.curPhotos){
      this.idPhotoToLoad = idPhoto;
    }
    else{
      this.curPhoto = this.curPhotos.find(photo => photo.idPhoto === idPhoto);
      this._getNextPrevPhoto(this.curPhoto);
    }
  }

  /**
   * Retourne à la galérie
   */
  returnGalery(){
    this.curPhoto = null;
    this.nextPhoto = null;
    this.prevPhoto = null;
    this.curVideo = null;
    this.nextVideo = null;
    this.prevVideo = null;
  }

  private _getNextPrevPhoto(photo: PhotoModel){
    let currentPosition = this.curPhotos.indexOf(photo);
    if (currentPosition < this.curPhotos.length){
      this.nextPhoto = this.curPhotos[currentPosition + 1];
    }
    else{
      this.nextPhoto = null;
    }
    if (currentPosition > 0){
      this.prevPhoto = this.curPhotos[currentPosition - 1];
    }
    else{
      this.prevPhoto = null;
    }
  }

  private _getNextPrevVideo(video: VideoModel){
    let currentPosition = this.curVideos.indexOf(video);
    if (currentPosition < this.curVideos.length){
      this.nextVideo = this.curVideos[currentPosition + 1];
    }
    else{
      this.nextVideo = null;
    }
    if (currentPosition > 0){
      this.nextVideo = this.curVideos[currentPosition - 1];
    }
    else{
      this.nextVideo = null;
    }
  }

  private _buildParentTree(tree, currentAlbum){
    if (tree.parent){
      if (currentAlbum.id === tree.id){
        this.parentList.unshift({id : tree.parent.id, title : tree.parent.title});
        console.log(this.parentList);
        let albumParent: AlbumModel = {id: tree.parent.id, title : tree.parent.title, description : tree.parent.description};
        albumParent.listAlbum = currentAlbum;
        this._buildParentTree(tree.parent,albumParent);
      }
      else{
        console.error("Error logic in build parent tree");
      }
    }
  }

  private _loadPhotoVideoAfterInit(){
    if (this.idPhotoToLoad){
      this.curPhoto = this.curPhotos.find(photo => photo.idPhoto === this.idPhotoToLoad);
      this._getNextPrevPhoto(this.curPhoto);
      this.idPhotoToLoad = 0;
    }
    if (this.idVideoToLoad){
      this.curVideo = this.curVideos.find(video => video.idVideo === this.idVideoToLoad);
      this._getNextPrevVideo(this.curVideo);
      this.idVideoToLoad = 0;
    }
  }

  getYears(){
    this.timeYears = [];
    this.timeMonths = [];
    this.timeDays = [];
    this.curPhotos.map( p => {
      let year = p.shootDate.getFullYear();
      let month = p.shootDate.getMonth();
      let day = p.shootDate.getDate();
      if (this.timeYears.indexOf(year) === -1){
        this.timeYears.push(year);
      }
      if (this.timeMonths.findIndex( d => d.y === year && d.m === month) === -1){
        this.timeMonths.push({ y : year, m: month });
      }
      if (this.timeDays.findIndex( d => d.y === year && d.m === month  && d.d === day) === -1){
        this.timeDays.push({ y : year, m: month, d: day });
      }
    });
    this.timeYears.sort((a,b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    this.timeMonths.sort((a,b) => {
      if (a.y * 100 + a.m < b.y * 100 + b.m) return -1;
      if (a.y * 100 + a.m > b.y * 100 + b.m) return 1;
      return 0;
    });
    this.timeDays.sort((a,b) => {
      if (a.y * 10000 + a.m * 100 + a.d < b.y * 10000 + b.m * 100 + b.d) return -1;
      if (a.y * 10000 + a.m * 100 + a.d > b.y * 10000 + b.m * 100 + b.d) return 1;
      return 0;
    });
  }

  filterYears(year){
    this.curPhotos = this.curCat.photos.filter( p => p.shootDate.getFullYear() === year);
  }

  filterMonth(year, month){
    this.curPhotos = this.curCat.photos.filter( p => p.shootDate.getFullYear() === year && p.shootDate.getMonth() === month);
  }

  filterDay(year, month, day){
    this.curPhotos = this.curCat.photos.filter( p => p.shootDate.getFullYear() === year && p.shootDate.getMonth() === month && p.shootDate.getDate() === day );
  }

  cancelFilter(){
    this.curPhotos = [...this.curCat.photos];
  }

}
