import { Injectable } from '@angular/core';
import { PhotoModel } from '../models/photo.model';
import { TagModel } from '../models/tag.model';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { AlbumModel } from '../models/album.model';
import { Observable } from 'rxjs';

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


}
