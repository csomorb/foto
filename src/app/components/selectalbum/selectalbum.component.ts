import { Component, OnInit, EventEmitter, Output, ElementRef, ViewChild, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder } from '@angular/forms';
import { AlbumModel } from 'src/app/models/album.model';

@Component({
  selector: 'app-selectalbum',
  templateUrl: './selectalbum.component.html',
  styleUrls: ['./selectalbum.component.css']
})
export class SelectalbumComponent implements OnInit {

  listAlbums:Array<any>;
  modeAdd = false;
  selectAlbum;
  excludedAlbum;

  @Output() selectedAlbum = new EventEmitter<number>();
  @Input('defaultSelectedIdALbum') defaultSelectedIdALbum?: number;
  @Input('exeptIdAlbum') exeptIdAlbum?: number;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initSelect(this.defaultSelectedIdALbum);
  }

  initSelect(selectedAlbum: number){
    this.apiService.getAlbums().subscribe(listeAlbums => {
      this.listAlbums = [];
      this.buildTree('',listeAlbums);

      if (this.exeptIdAlbum){

        this.excludedAlbum = this.listAlbums.splice(this.listAlbums.findIndex(album => album.id == this.exeptIdAlbum),1)[0];
        console.log(this.excludedAlbum)
      }
      const indexSelectedAlbum = this.listAlbums.findIndex( album => album.id == selectedAlbum);
      if(indexSelectedAlbum !== -1){
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
    if (this.excludedAlbum){
      this.listAlbums.push(this.excludedAlbum);
    }
  }

  cancelModeAdd(){
    this.modeAdd = false;
    if (this.excludedAlbum){
      this.listAlbums.pop();
    }
  }

}
