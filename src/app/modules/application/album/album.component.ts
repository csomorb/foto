import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AlbumModel } from 'src/app/models/album.model';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})

export class AlbumComponent implements OnInit {

  constructor(private route: ActivatedRoute, public catService: CategoryService) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = parseInt(params.get('idAlbum'));
      if (id){
        this.catService.loadAlbum(id);
      }
      else{
        this.catService.loadRootAlbum();
      }
    });
  }

}
