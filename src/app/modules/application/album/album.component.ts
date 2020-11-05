import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AlbumService } from 'src/app/services/album.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AlbumModel } from 'src/app/models/album.model';
import { environment } from 'src/environments/environment';
import { PhotoModel } from 'src/app/models/photo.model';
import { VideoModel } from 'src/app/models/video.model';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})

export class AlbumComponent implements OnInit {

  album: AlbumModel;

  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router,
    public albumService: AlbumService) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = parseInt(params.get('idAlbum'));
      if (id){
        this.albumService.loadAlbum(id);
      }
      else{
        this.albumService.loadRoot();
      }
    });
  }

}
