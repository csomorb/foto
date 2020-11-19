import { Injectable } from '@angular/core';
import { PhotoModel } from '../models/photo.model';
import { TagModel } from '../models/tag.model';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { AlbumModel } from '../models/album.model';
import { Observable } from 'rxjs';
import { PeopleModel } from '../models/people.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  /**
   * Retourne la photo
   * @param id
   */
  getPhoto(id:number){
    return this.http.get<PhotoModel>(`${environment.apiUrl}/photos/${id}`);
  }

  /**
   * Modifie la photo donnée
   * @param photo
   */
  putPhoto(photo: PhotoModel){
    let body = {
      title: photo.title,
      description: photo.description,
      shootDate: photo.shootDate
    };
    return this.http.put<PhotoModel>(`${environment.apiUrl}/photos/${photo.idPhoto}`, body);
  }

  /**
   * Supprime la photo donnée
   * @param photo
   */
  deletePhoto(photo: PhotoModel){
    return this.http.delete<any>(`${environment.apiUrl}/photos/${photo.idPhoto}`);
  }

  /**
   * Supprime l'album donnée
   * @param album
   */
  deleteAlbum(album: AlbumModel){
    return this.http.delete<any>(`${environment.apiUrl}/albums/${album.id}`);
  }

  /**
   * Met à jour l'album donnée
   * @param album
   */
  updateAlbum(album: AlbumModel){
    let body = {
      title : album.title,
      description : album.description
    };
    return this.http.put<AlbumModel>(`${environment.apiUrl}/albums/${album.id}`, body);
  }

  /**
   * Change la photo de couverture
   * @param album
   * @param photo
   */
  putCover(album: AlbumModel, photo: PhotoModel){
    return this.http.put<AlbumModel>(`${environment.apiUrl}/albums/${album.id}/cover/${photo.idPhoto}`, null);
  }

  /**
   * Supprime la photo de couverture d'un album
   * @param album
   */
  putNoCover(album: AlbumModel){
    return this.http.put<AlbumModel>(`${environment.apiUrl}/albums/${album.id}/cover/0`, null);
  }

  /**
   * Renvoie la liste de tous les albums avec la photo de couverture
   */
  getAlbums(){
    return this.http.get<Array<AlbumModel>>(`${environment.apiUrl}/albums`);
  }

  /**
   * Renvoie la liste des albums racines avec la photo de couverture
   */
  getRootsAlbums(){
    return this.http.get<Array<AlbumModel>>(`${environment.apiUrl}/albums/roots`);
  }

  /**
   * Renvoie un album avec la photo de couverture
   * @param id
   */
  getAlbum(id:number){
    return this.http.get<AlbumModel>(`${environment.apiUrl}/albums/${id}`);
  }

  /**
   * Renvoie les albums parents
   * @param id
   */
  getAlbumParents(id:number){
    return this.http.get<any>(`${environment.apiUrl}/albums/${id}/parents-tree`);
  }

  /**
   * Renvoie un album avec la photo de couverture et les photos qu'elle contient
   */
  getAlbumWithPhotos(id:number){
    let url = environment.apiUrl + '/albums/' + id + '/photos';
    return this.http.get<AlbumModel>(url);
  }

  getSSAlbums(id:number){
    let url = environment.apiUrl + '/albums/' + id + '/childrens-tree';
    return this.http.get<any>(url);
  }

  /**
   * Supprime la personne donnée
   * @param people
   */
  deletePeople(people: PeopleModel){
    return this.http.delete<any>(`${environment.apiUrl}/peoples/${people.id}`);
  }

  /**
   * Met à jour la personne donnée
   * @param people
   */
  updatePeople(people: PeopleModel){
    let body = people.birthDay ?  {title : people.title, description: people.description, birthDay: people.birthDay } : {title : people.title, description: people.description };
    return this.http.put<AlbumModel>(`${environment.apiUrl}/peoples/${people.id}`, body);
  }

  /**
   * Ajoute une nouvelle personne
   * @param name
   * @param description
   * @param birthDay
   */
  postPeople(name: string, description:string, birthDay?: Date){
    let people = birthDay ?  {title : name, description: description, birthDay: birthDay } : {title : name, description: description };
    return this.http.post<PeopleModel>(environment.apiUrl + '/peoples/', people);
  }

  /**
   * Renvoie les détails d'une personne avec les photos
   * @param idPeople
   */
  getPeopleWithPhotos(idPeople:number){
    let url = environment.apiUrl + '/peoples/' + idPeople + '/photos';
    return this.http.get<PeopleModel>(url);
  }

  /**
   * Renvoie toutes les personnes avec leur photo de profil et les photos?
   */
  getRootsPeoples(){
    return this.http.get<Array<PeopleModel>>(`${environment.apiUrl}/peoples/roots`);
  }

  /**
   * Renvoie toutes les personnes avec leur photo de profil
   */
  getPeoples(){
    return this.http.get<Array<PeopleModel>>(`${environment.apiUrl}/peoples`);
  }

  /**
   * Créer un nouvel album
   * @param title
   * @param description
   * @param idParent
   */
  postAlbum(title:string, description: string, idParent?: number){
    let album = idParent ?  {title : title, description: description,idParent: idParent } : {title : title, description: description };
    return this.http.post<AlbumModel>(environment.apiUrl + '/albums/', album);
  }


  /**
   * Upload une photo dans l'album donné avec le titre et la description donné
   * @param file
   * @param idAlbum
   * @param title
   * @param description
   */
  upload(file: File, idAlbum: number, title: string, description: string): Observable<HttpEvent<any>>{
    const formData: FormData = new FormData();

    formData.append('file', file);
    formData.append('idAlbum',idAlbum.toString());
    formData.append('title', title);
    formData.append('description', description);

    const req = new HttpRequest('POST', `${environment.apiUrl}/photos/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  /**
   * Supprime le tag donnée
   * @param tag
   */
  deleteTag(tag: TagModel){
    return this.http.delete<any>(`${environment.apiUrl}/tags/${tag.id}`);
  }

  /**
   * Met à jour le tag donnée
   * @param tag
   */
  updateTag(tag: TagModel){
    let body = {title : tag.title, description: tag.description};
    return this.http.put<AlbumModel>(`${environment.apiUrl}/tags/${tag.id}`, body);
  }

  /**
   * Ajoute un nouveau tag
   * @param name
   * @param description
   */
  postTag(title: string, description:string){
    let tag = {title : name, description: description} ;
    return this.http.post<TagModel>(environment.apiUrl + '/tags/', tag);
  }

  /**
   * Renvoie les détails d'une personne avec les photos
   * @param idTag
   */
  getTagWithPhotos(idTag:number){
    let url = environment.apiUrl + '/tags/' + idTag + '/photos';
    return this.http.get<TagModel>(url);
  }

  /**
   * Renvoie toutes les tags avec leur photo de profil et les photos?
   */
  getRootsTags(){
    return this.http.get<Array<TagModel>>(`${environment.apiUrl}/tags/roots`);
  }

  /**
   * Renvoie toutes les tags avec leur photo de profil
   */
  getTags(){
    return this.http.get<Array<TagModel>>(`${environment.apiUrl}/tags`);
  }

}
