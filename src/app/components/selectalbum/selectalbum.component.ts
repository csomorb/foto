import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-selectalbum',
  templateUrl: './selectalbum.component.html',
  styleUrls: ['./selectalbum.component.css']
})
export class SelectalbumComponent implements OnInit {

  listAlbums = [];
  modeAdd = false;

  @Output() selectedAlbum = new EventEmitter<number>();

  constructor(private apiService: ApiService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.apiService.getAlbums().subscribe(listeAlbums => {
      console.log(listeAlbums);
      this.buildTree('',listeAlbums);
      if (this.listAlbums.length)
        this.selectedAlbum.emit(this.listAlbums[0].id);
    });
  }

  buildTree(prefix : string, listAlbums: Array<any>){
    listAlbums.forEach( album => {
        this.listAlbums.push({id : album.id ,title: prefix ? prefix + ' / ' + album.title : album.title });
        if (album.children.length){
          this.buildTree(prefix ? prefix + ' / ' + album.title : album.title, album.children);
        }
    });
  }

  changeSelectedAlbum(e){
    this.selectedAlbum.emit(parseInt(e.target.value));
  }


}
