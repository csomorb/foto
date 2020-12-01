import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './modules/general/not-found/not-found.component';
import { LoginComponent } from './modules/general/login/login.component';
import { AlbumComponent } from './modules/application/album/album.component';
import { HomeComponent } from './modules/general/home/home.component';
import { PhotoComponent } from './components/photo/photo.component';
import { VideoComponent } from './components/video/video.component';
import { UploaderComponent } from './modules/application/uploader/uploader.component';
import { PeopleComponent } from './modules/application/people/people.component';
import { AlbumgalleryComponent } from './modules/application/album/albumgallery/albumgallery.component';
import { PeoplegalleryComponent } from './modules/application/people/peoplegallery/peoplegallery.component';
import { TagComponent } from './modules/application/tag/tag.component';
import { TaggalleryComponent } from './modules/application/tag/taggallery/taggallery.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'albums', component: AlbumComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'gallery' },
      { path: 'gallery', component: AlbumgalleryComponent },
    ]
  },
  { path: 'albums/:idAlbum', component: AlbumComponent ,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'gallery' },
      { path: 'gallery', component: AlbumgalleryComponent },
      { path: 'photos/:idPhoto', component: PhotoComponent },
      { path: 'videos/:idVideo', component: VideoComponent }
      ]
  },
  { path: 'peoples', component: PeopleComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'gallery' },
      { path: 'gallery', component: PeoplegalleryComponent },
    ]
  },
  { path: 'peoples/:idPeople', component: PeopleComponent ,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'gallery' },
      { path: 'gallery', component: PeoplegalleryComponent },
      { path: 'photos/:idPhoto', component: PhotoComponent },
      { path: 'videos/:idVideo', component: VideoComponent }
      ]
  },
  { path: 'tags', component: TagComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'gallery' },
      { path: 'gallery', component: TaggalleryComponent },
    ]
  },
  { path: 'tagss/:idTag', component: TagComponent ,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'gallery' },
      { path: 'gallery', component: TaggalleryComponent },
      { path: 'photos/:idPhoto', component: PhotoComponent },
      { path: 'videos/:idVideo', component: VideoComponent }
      ]
  },
  { path: 'upload', component: UploaderComponent },
  { path: 'upload/:idAlbum', component: UploaderComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
