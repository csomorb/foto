import { Component, OnInit, Input, HostListener } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PhotoModel } from 'src/app/models/photo.model';
import { AlbumService } from 'src/app/services/album.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  ESCAPE = 27
}

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.css']
})
export class PhotoComponent implements OnInit {

  photoBaseUrl: string = environment.apiUrl;

  constructor(public albumService: AlbumService, private router: Router,
    private location: Location, private route: ActivatedRoute) { }

  moveNextPhoto(){
    let previousPhotoId = this.albumService.currentPhoto.idPhoto;
    this.albumService.moveNextPhoto();
    let cururl = this.location.path().replace( "photos/"+previousPhotoId, "photos/" + this.albumService.currentPhoto.idPhoto );
    this.location.go(cururl);
  }

  movePrevPhoto(){
    let previousPhotoId = this.albumService.currentPhoto.idPhoto;
    this.albumService.movePrevPhoto();
    let cururl = this.location.path().replace( "photos/"+previousPhotoId, "photos/" + this.albumService.currentPhoto.idPhoto );
    this.location.go(cururl);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      this.moveNextPhoto();
    }
    if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      this.movePrevPhoto();
    }
    if (event.keyCode === KEY_CODE.ESCAPE) {
      this.returnGalery();
    }
  }

  returnGalery(){
    this.albumService.returnGalery();
    this.router.navigateByUrl("/albums/"+this.albumService.currentAlbum.id);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const idPhoto = parseInt(params.get('idPhoto'));
      this.albumService.loadPhotoFromId(idPhoto);
    });
  }

}
