import { Component, OnInit, EventEmitter, Output, ElementRef, ViewChild } from '@angular/core';
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
  selectAlbum;

  @Output() selectedAlbum = new EventEmitter<number>();


  constructor(private apiService: ApiService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initSelect(0);
  }

  initSelect(selectedAlbum){
    this.apiService.getAlbums().subscribe(listeAlbums => {
      this.listAlbums = [];
      console.log(listeAlbums);
      this.buildTree('',listeAlbums);
      if(selectedAlbum){
        this.selectAlbum = selectedAlbum;
        this.selectedAlbum.emit(selectedAlbum);
      }
      else if(this.listAlbums.length){
        this.selectAlbum = this.listAlbums[0].id;
        this.selectedAlbum.emit(this.listAlbums[0].id);
      }
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
    if(!this.modeAdd){
      this.selectedAlbum.emit(parseInt(e.target.value));
    }
  }

  addAlbum(album){
    console.log(album);
    if(album.title)
    this.apiService.postAlbum(album.title,album.description,album.idAlbum).subscribe(newAlbum => {
      this.modeAdd = false;
      this.initSelect(newAlbum.id);
      }
    );
  }

  toModeAdd(){
    this.modeAdd = true;
  }

  cancelModeAdd(){
    this.modeAdd = false;
  }

}
