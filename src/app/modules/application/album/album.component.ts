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
      this.apiService.getAlbumWithPhotos(id).subscribe(album => (this.album = album));
      });
  }

}
