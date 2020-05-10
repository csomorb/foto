import { Injectable } from '@angular/core';
import { PhotoModel } from '../models/photo.model';
import { TagModel } from '../models/tag.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AlbumModel } from '../models/album.model';

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
   * Renvoie la liste de tous les albums avec la photo de couverture
   */
  getAlbums(){
    return this.http.get<Array<AlbumModel>>(`${environment.apiUrl}/albums`);
  }

  /**
   * Renvoie un album avec la photo de couverture
   * @param id
   */
  getAlbum(id:number){
    return this.http.get<AlbumModel>(`${environment.apiUrl}/albums/${id}`);
  }

  /**
   * Renvoie un album avec la photo de couverture et les photos qu'elle contient
   */
  getAlbumWithPhotos(id:number){
    let url = environment.apiUrl + '/albums/' + id + '/photos';
    return this.http.get<AlbumModel>(url);
  }


}
