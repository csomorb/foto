import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AlbumModel } from 'src/app/models/album.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})
export class AlbumComponent implements OnInit {

  album: AlbumModel;
  photoBaseUrl: string = environment.apiUrl;

  constructor(private apiService: ApiService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = parseInt(params.get('idAlbum'));
      if (id){
        this.apiService.getAlbumWithPhotos(id).subscribe(album => {this.album = album;
          this.apiService.getSSAlbums(id).subscribe(liste => {
            this.album.listAlbum = liste.children;
            this.album.listAlbum.forEach((ssAlbum, i) =>
              this.apiService.getAlbum(ssAlbum.id).subscribe( ssAlbumWithCover => this.album.listAlbum[i] = ssAlbumWithCover)
              //TODO: si pas de cover prendre une photo au hasard
            );

          });
        console.log(album)
        });
      }
      else{
        console.log("Chargement racine");
      }
      });
  }

}
